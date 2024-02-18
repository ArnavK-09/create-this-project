/**
 * Imports required
 */
const core = require("@actions/core");
const github = require("@actions/github");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Returns random item from array
 * @param {any[]} array
 */
const getRandomItemFromArray = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

/**
 * Generates random color hex
 */
const generateRandomColor = () =>
  Math.floor(Math.random() * 16777215).toString(16);

/**
 * Create label for repo if not there
 * @param {string} label
 * @param octokit
 * @param {string} repo
 */
const createLabelIfNotThere = async (label, octokit, repo) => {
  // checking label there
  core.notice(`Fetching Label:- ${label}`);
  const data = await octokit.request(
    `GET /repos/${repo.owner}/${repo.repo}/labels/${label}`,
  );
  if (data.status !== 200) {
    // creating new label
    const COLOR = generateRandomColor().replace("#", "");
    core.notice(`Creating Label For:- ${label} | With Color:- ${COLOR}`);
    octokit.request(
      `POST /repos/${repo.owner}/${repo.repo}/labels/${label}`,
      {
        ...repo,
        name: label.toString(),
        color: COLOR,
      },
    );
  }
};

/**
 * Create prompt for google's gemini
 * @param {string} lib
 * @param {string} difficulty
 * @param {string?} custom_prompt
 * @returns string
 */
const generateGeminiPrompt = (lib, difficulty, custom_prompt) => {
  return `
# Your task is to give me a programming challenge of ${lib.toUpperCase()} of difficulty ${difficulty.toUpperCase()}. Act like you don't know how to resolve this challenge.
${custom_prompt ? `You shall follow this instructions: ${custom_prompt}` : ""} 

# !! Your response should be in JSON format strictly following scheme:-
{
  "title": "Title for challege including emoji at starting",
  "body": "Description for this challenge with requirements and example and minimal guidance! MAKE SURE YOU TYPE BODY IN MARKDOWN! use \\n for new lines, give content of body in single line, to make VALID JSON STRING"
}
  
# Extra instructions:-
Make sure you respond with a challenge in respect to ${lib}.
Response with only raw and VALID JSON content, not in codeblock.
`.trim();
};

/**
 * Executing action
 */
const executeAction = async () => {
  try {
    /**
     * Fetching all inputs
     */
    const GH_REPO = github.context.repo;
    const GH_G_API_KEY = core.getInput("gemini_api_key", {
      required: true,
    });
    const GH_USER_TOKEN = core.getInput("token", {
      required: true,
    });
    const GH_LIBS_INPUT = core.getInput("libs", {
      required: true,
    });
    const GH_ISSUE_DIFFCULTIES = core.getInput("difficulties", {
      required: true,
    });
    const GH_ISSUE_ADDITIIONS = core.getInput("custom_additions", {
      required: false,
    });
    core.notice(`Repo Owner: ${GH_REPO.owner}\nRepo Name: ${GH_REPO.repo}`);

    /**
     * Creating github client
     */
    const octokit = new github.getOctokit(GH_USER_TOKEN);
    core.debug("Created github client");

    /**
     * Parsing Libs by user
     */
    const GH_LIBS = [];
    GH_LIBS_INPUT.trim()
      .split(",")
      .forEach((lib) => GH_LIBS.push(lib.toString()));
    core.notice(`User mentioned these libs: ${GH_LIBS}`);

    /**
     * Parsing diffculties by user
     */
    const GH_DIFFCULTIES = [];
    GH_ISSUE_DIFFCULTIES.trim()
      .split(",")
      .forEach((diff) => GH_DIFFCULTIES.push(diff.toString()));
    core.notice(`User mentioned these difficulties: ${GH_ISSUE_DIFFCULTIES}`);

    /**
     * Creating new Gemini API Client Instance
     * Also, new gemini-pro model
     */
    const GOOGLE_AI = new GoogleGenerativeAI(GH_G_API_KEY);
    const GOOGLE_GEMINI = GOOGLE_AI.getGenerativeModel({
      model: "gemini-pro",
    });

    /**
     * Get random lib & difficulty
     */
    const LIB = getRandomItemFromArray(GH_LIBS);
    core.notice("Choosen Lib:- " + LIB);

    /**
     * Get difficulty
     */
    const DIFFICULTY = getRandomItemFromArray(GH_DIFFCULTIES);
    core.notice("Choosen Difficulty:- " + DIFFICULTY);

    /**
     * Generating title with gemini
     */
    const NEW_ISSUE_CONTENT = await GOOGLE_GEMINI.generateContent(
      generateGeminiPrompt(LIB, DIFFICULTY, GH_ISSUE_ADDITIIONS ?? undefined),
    );
    core.debug(
      "Using prompt:-" +
        generateGeminiPrompt(LIB, DIFFICULTY, GH_ISSUE_ADDITIIONS ?? undefined),
    );

    /**
     * Regulating Labels
     */
    const ISSUE_LABELS = [DIFFICULTY, LIB];
    ISSUE_LABELS.forEach((x) => {
      createLabelIfNotThere(x, octokit, GH_REPO);
    });

    /**
     * Parse content
     */
    const RES = NEW_ISSUE_CONTENT.response.text().toString().trim();
    core.debug(`Gemini's Raw Response:- ${RES}`);
    const ISSUE_DATA = JSON.parse(RES);
    core.debug(`Gemini's JSON Response:- ${JSON.stringify(ISSUE_DATA)}`);

    /**
     * Create a comment on the PR with the information we compiled from the
     * list of changed files.
     */
    await octokit.rest.issues.create({
      ...GH_REPO,
      title: ISSUE_DATA.title ?? `Create me project for '${LIB}'`,
      body: ISSUE_DATA.body ?? "",
      labels: ISSUE_LABELS,
    });
    core.debug("Action completed");
  } catch (error) {
    /**
     * Any error during action recorded
     */
    core.setFailed(error);
  }
};

/**
 * Initializing action to create issue
 */
executeAction();

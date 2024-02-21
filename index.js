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
const createLabelIfNotThere = (label, octokit, repo) => {
  return new Promise(async (resolve) => {
    const COLOR = generateRandomColor().replace("#", "");
    core.notice(`Creating Label For:- ${label} | With Color:- ${COLOR}`);
    await octokit
      .request(`POST /repos/${repo.owner}/${repo.repo}/labels/${label}`, {
        ...repo,
        name: label.toString(),
        color: COLOR,
      })
      .then(() => {
        core.notice(`Created Label For:- ${label} | With Color:- ${COLOR}`);
        resolve(true);
      })
      .catch(() => resolve(false));
  });
};

/**
 * Create a comment on the PR with the information we compiled from the list of changed files.
 */
const createIssue = (octokit, data, labels, GH_REPO, LIB) => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      console.debug("Init creating issue");
      await octokit.rest.issues
        .create({
          ...GH_REPO,
          title: data[0] ?? `🍳 Create me project for '${LIB}'`,
          body: data[1] ?? "",
          labels: labels,
        })
        .then(() => {
          core.notice(`Created Issue!`);
          resolve(true);
        })
        .catch((e) => {
          core.warning(`Unable to create Issue :( :- ${e}`);
          resolve(false);
        });
    }, 1000 * 20);
  });
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
  ${
    custom_prompt ? `You shall follow this instructions: ${custom_prompt}` : ""
  } 

  # !! Your response should be in format strictly following scheme:-
  
  \`
  (TITLE) Title for challenge including EMOJIi at starting ||| (DESCRIPTION) Description for this challenge with requirements and example and minimal guidance! MAKE SURE YOU TYPE BODY/DESCRIPTION IN MARKDOWN! Also add example usage and example if there, ELABORATE MUCH
  \`
  
  ## SEPERATED BY ||| && all content in single line, use \\n for new lines
    
  # Extra instructions:-
  Make sure you respond with a challenge in respect to ${lib.toUpperCase()}.
  Response with only raw and VALID text content, SEPERATED BY ||| (triple pipes), not in code block.
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
     * Parse content
     */
    const RES = NEW_ISSUE_CONTENT.response.text().toString().trim();
    core.debug(`Gemini's Raw Response:- ${RES}`);
    const ISSUE_DATA = RES.split("|||");

    /**
     * Regulating Labels
     */
    const ISSUE_LABELS = [DIFFICULTY, LIB];
    const ISSUE_PROMISES = [];

    /**
     * Adding funcs
     */
    ISSUE_LABELS.forEach((x) => {
      ISSUE_PROMISES.push(createLabelIfNotThere(x, octokit, GH_REPO));
    });
    ISSUE_PROMISES.push(
      createIssue(octokit, ISSUE_DATA, ISSUE_LABELS, GH_REPO, LIB),
    );

    /**
     * Execute all logics
     */
    Promise.allSettled(ISSUE_PROMISES).then(async (e) => {
      core.info("Action completed", e);
    });
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

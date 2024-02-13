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
 * Create prompt for google's gemini
 * @param {string} lib
 * @param {string?} custom_prompt
 * @returns string
 */
const generateGeminiPrompt = (lib, custom_prompt) => {
  return `
        
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
    const GH_G_API_KEY = core.getInput("gemini_api_key", { required: true });
    const GH_USER_TOKEN = core.getInput("token", { required: true });
    const GH_ISSUE_ADDITIIONS = core.getInput("custom_additions", {
      required: false,
    });
    const GH_REPO = github.context.repo;
    const GH_LIBS_INPUT = core.getInput("libs", { required: true });
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
     * Creating new Gemini API Client Instance
     * Also, new gemini-pro model
     */
    const GOOGLE_AI = new GoogleGenerativeAI(GH_G_API_KEY);
    const GOOGLE_GEMINI = GOOGLE_AI.getGenerativeModel({ model: "gemini-pro" });

    /**
     * Get random lib
     */
    const LIB = getRandomItemFromArray(GH_LIBS);
    core.notice("Choose this Lib:- ", LIB);

    /**
     * Generating title with gemini
     */
    const NEW_ISSUE_CONTENT_RAW = await GOOGLE_GEMINI.generateContent(
      generateGeminiPrompt(GH_ISSUE_ADDITIIONS),
    );

    /**
     * Parse content
     */
    const ISSUE_DATA = JSON.parse(NEW_ISSUE_CONTENT_RAW.trim());
    core.debug("Data from Gemini:-\n", ISSUE_DATA);

    /**
     * Create a comment on the PR with the information we compiled from the
     * list of changed files.
     */
    await octokit.rest.issues.create({
      ...GH_REPO,
      title: ISSUE_DATA.title ?? `Create me project for '${LIB}'`,
      body: ISSUE_DATA.description ?? "",
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

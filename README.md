# ⏰ Create custom challenges issues using Gemini AI!

> [!NOTE]  
> The [**`create-this-project@action`**](https://github.com/ArnavK-09/create-this-project/tree/action) project is a public **GitHub Action** available in the GitHub Marketplace.
>
> This project is powered by the **Google Gemini Pro API**, which enables seamless integration and efficient way to create challenge's data!

---

## 🥞 Setup Guide

> **To set up the `create-this-project@action` action, follow these steps:**

### 1. 🍬 **Action Setup**

- Visit the [GitHub Marketplace page](https://github.com/marketplace/actions/publish-idea-as-issue) for the action.
- Click on the "Set up a workflow" button.
- Choose the repository where you want to use the action.
- Add `GEMINI_API_KEY` secret in your repository secrets from settings
- Create a new workflow file (e.g., `.github/workflows/convert-pull-request-title.yml`).
- **Add the following code to the workflow file:**

```yaml
name: Post Project Idea as Issue...

on:
  schedule:
    - cron: "0 0 * * *" # Every Day

jobs:
  idea_as_issue:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - name: Action to create issues stating ideas for new projects!
        uses: ArnavK-09/create-this-project@action
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
          token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. 🍬 **Action Inputs**

| Input Name         | Description                                                                                                     | Required | Default                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `gemini_api_key`   | The API key for accessing the Google Gemini LLM API.                                                            | true     |                                                                                           |
| `difficulties`     | Give difficulties for ideas to choose from...seperated by commas                                                | false    | Hard, Medium, Easy, Super-Easy, Hardest, Moderate                                         |
| `libs`             | Give libs or languages for ideas to choose from...seperated by commas                                           | false    | Javascript, Typescript, Python, Scala, React.js, Angular, Vue, Nodejs, Discord.js, Pygame |
| `token`            | The GitHub token for authentication and authorization. Use `${{ secrets.GITHUB_TOKEN }}` to access it securely. | true     |                                                                                           |
| `custom_additions` | Any extra custom additions you want in issue creations                                                          | false    |                                                                                           |

> [!TIP]
>
> ##### 🍗 Example Usage
>
> You can preview this action working **[here](https://github.com/ArnavK-09/create-this-project/issues)!**

---

## 🎋 Links

- [GitHub Action: create-this-project](https://github.com/marketplace/actions/publish-idea-as-issue)
- [Repository: ArnavK-09/create-this-project](https://github.com/ArnavK-09/create-this-project/tree/action)

<p align="center"><strong>🌟 Star this repo :) </strong></p>

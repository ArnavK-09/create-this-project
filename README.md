# ⏰ Create custom challenges issues using Gemini AI!

> [!NOTE]  
> The [**`create-this-project@action`**](https://github.com/ArnavK-09/create-this-project/tree/action) project is a public **GitHub Action** available in the GitHub Marketplace.
>
> This project is powered by the **Google Gemini Pro API**, which enables seamless integration and efficient way to create challenge's data!

---

## 🥞 Setup Guide

> **To set up the `create-this-project@action` action, follow these steps:**

### 1. 🍬 **Action Setup**

- Visit the [GitHub Marketplace page](https://github.com/marketplace/actions/create-this-project) for the action.
- Click on the "Set up a workflow" button.
- Choose the repository where you want to use the action.
- Add ` GEMINI_API_KEY ` secret in your repository secrets from settings
- Create a new workflow file (e.g., `.github/workflows/convert-pull-request-title.yml`).
- **Add the following code to the workflow file:**

```yaml
name: Initiate Challenges...

on:
  workflow_dispatch:
  schedule:
    - cron: '5 24 * * *' # Every Day

jobs:
  convert:
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

| Input Name       | Description                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `gemini_api_key` | The API key for accessing the Google Gemini LLM API.                                                            |
| `token`          | The GitHub token for authentication and authorization. Use `${{ secrets.GITHUB_TOKEN }}` to access it securely. |

> [!TIP]
>
> ##### 🍗 Example Usage 
> You can pewview this action working **[here](https://github.com/ArnavK-09/create-this-project/issues)!**

---

## 🎋 Links

- [GitHub Action: create-this-project](https://github.com/marketplace/actions/create-this-project)
- [Repository: ArnavK-09/create-this-project](https://github.com/ArnavK-09/create-this-project/tree/action)

<p align="center"><strong>🌟 Star this repo :) </strong></p>

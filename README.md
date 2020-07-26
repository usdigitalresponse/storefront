This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

It is a single page app in React with a serverless backend currently being served by Netlify.

## Development

### Setup Overview

1. Request access to this repo, Airtable, SendGrid, and Netlify
2. [Add API keys](#api-keys-and-env) to your local `.env` file
3. Run `yarn`, `yarn start`, and `yarn start:api` to [install dependencies and start the app](#running-the-app)

### API Keys and `.env`

Ask someone with access to invite you to the USDR Food Airtable workspace. Once you have access:

#### 1. Get Airtable API keys

**Airtable API Key**

Create an Airtable account and copy your personal API key at https://airtable.com/account.

**Airtable Base ID**

To get a base ID, go to https://airtable.com/api and click on any USDR Food base e.g. Storefront Demo.

The app ID begins with `app`. You can either grab the ID from the url `https://airtable.com/[some_key_beginning_with_app]/api/` or it will be displayed in the Introduction section: `The ID of this base is [some_key_beginning_with_app].`

*Note: It is recommended that you clone the Storefront Demo base and use this copy while developing. This way you can test schema changes without worrying about breaking other instances of the app.*

#### 2. Get Stripe API keys

There are two Stripe API keys, a main Stripe key and a donation Stripe key. Both are located in the `Config` table of any USDR Food Airtable base under the `stripe_donation_public_api_key` and `stripe_main_public_api_key` fields.

#### 3. Create `.env`

Create a `.env` file in the repo's root directory using a copy of [`.example.env`](https://github.com/usdigitalresponse/storefront/blob/master/.example.env) and add your keys:

```
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
STRIPE_MAIN_PRIVATE_API_KEY=
STRIPE_DONATION_PRIVATE_API_KEY=
```

These keys will be used when you run `yarn start:api` in the next section.

### Running the App

We use [yarn](https://classic.yarnpkg.com/en/) for managing packages instead of npm. You may run into this issue if you use npm: `/bin/sh: react-scripts: command not found`

View [yarn's docs](https://classic.yarnpkg.com/en/docs/install) for how to install in your OS.

#### 1. Install dependencies

```
yarn
```

#### 2. Run backend

```
yarn start:api
```

Runs a proxy for the serverless API in development.

If you run `yarn start` without [setting up your API keys](#api-keys-and-env) or running `yarn start:api`, the app will render but calls to the backend will return 500s.

#### 3. Run app

```
yarn start
```

Runs the app in development mode.

By default it will serve the app at [http://localhost:3000](http://localhost:3000) which you can view in your browser. The port number is configurable by setting `PORT=your_port_number` in your [`.env` file](#3-create-env).

The page will reload when you make edits. **You're ready to start contributing!**

#### 4. Build app

```
yarn build
```

*Note: Netlify automates our deploy process and this step is not normally required*

Builds a minified and optimized version of the app for production to the `build` folder. **Your app is ready to be deployed!**

See the section about [deployment](#setting-up-netlify-deploying-a-site) or [Create React App's docs](https://create-react-app.dev/docs/deployment) for more information.

### Sending Emails in Dev

Ask someone on the team for an invitation to the team SendGrid account. Once you have access:

#### 1. Set the SendGrid API key

You can grab the API key at https://app.sendgrid.com/settings/api_keys or have someone send it to you.

Add the SendGrid API key to your `.env` file:

```
SENDGRID_API_KEY=
```

#### 2. Set the `email_from_address` field in Airtable

In the `Config` table of your Airtable base, set the `email_from_address` to `storefront@usdigitalresponse.org`.

Restart the app. You should now be able to receive emails sent by the app (e.g. order confirmation email).

## Setting up Netlify

We use [Netlify](https://app.netlify.com/teams/usdr/sites) to manage deploys. Here are the steps you will need to deploy a new site:

1. Have someone with access invite you to the app.
2. Have someone give you access to this git repo (usdigitalresponse/storefront).
3. Sign up/Log in, ideally with your Github.
4. Click "New site from Git", choose Github as the provider.
5. Change the user to `usdigitalresponse` and you should see the option to choose `storefront`.
6. Enter `build` into the `publish directory` field.
7. Hit show advanced, and add the same variables as another site. You can find variables by clicking on a site, navigating to `Build & deploy` and then `Environment`. Generally, there should be 6 variables with the following keys (hint: hitting `edit` will allow you to see and copy the full key/value):

```
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
MASTER_AIRTABLE_API_KEY
MASTER_AIRTABLE_BASE_ID
STRIPE_DONATION_PRIVATE_API_KEY
STRIPE_MAIN_PRIVATE_API_KEY
SENDGRID_API_KEY
```

`AIRTABLE_BASE_ID` corresponds to the Airtable base for this project. You can find the id in the URL of your base after going to [api.airtable.com](api.airtable.com). You will need to obtain the Stripe and Sendgrid api keys from the partner after they have set up their respective Stripe and Sendgrid accounts.

## Deploying the site

All merges to master will deploy to every connected Netlify site. It will take a bit of time, but you'll be able to see the latest version within minutes.

## Testing Stripe checkout

Use the card number 4242 4242 4242 4242 with any expiration date and any 3 digit code.

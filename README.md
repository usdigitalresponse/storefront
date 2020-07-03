This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

It is a single page app in React with a serverless backend currently being served by Netlify.

## Development

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:4000](http://localhost:4000) to view it in the browser.

The page will reload if you make edits.<br />

### `yarn start:api`
Runs a proxy for the serverless API in development.


### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Setting up Netlify (Deploying a site)
We use [Netlify](https://app.netlify.com/teams/usdr/sites) to manage deploys. Here are the steps you will need to deploy a new site:
1. Have someone with access invite you to the app.
2. Have someone give you access to this git repo (usdigitalresponse/storefront).
3. Sign up/Log in, ideally with your Github.
4. Click "New site from Git", choose Github as the provider.
5. Change the user to `usdigitalresponse` and you should see the option to choose `storefront`.
6. Write `build` in the `publish directory` field.
7. Hit show advanced, and add the same variables as another site. You can find variables by clicking on a site, navigating to `Build & deploy` and then `Environment`. Generally, there should be 6 variables with the following keys (hint: hitting `edit` will allow you to see and copy the full key/value):
```
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
MASTER_AIRTABLE_API_KEY
MASTER_AIRTABLE_BASE_ID
STRIPE_DONATION_PRIVATE_API_KEY
STRIPE_MAIN_PRIVATE_API_KEY
```
The one that will be different than the defaults is `AIRTABLE_BASE_ID`, which will correspond to your unique Airtable. You can find the id in the URL of your base after going to [api.airtable.com](api.airtable.com).
8. Hit `Deploy Site`. It will take a bit of time, but you'll be able to see your site soon! You can also edit parts of the URL.

## Testing Stripe checkout
Use the card number 4242 4242 4242 4242 with any expiration date and any 3 digit code.

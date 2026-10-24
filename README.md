# Todo App
 
A simple CRUD to-do app built on AWS, using only always-free tier services.<br/>
Prod URL: https://d3983hh5nndqkk.cloudfront.net <br/>
Frontend Repo: https://github.com/vanmyngo/todo-app-frontend
 
## Tech Stack
 
### Backend
- AWS Lambda (Node.js 24, TypeScript, bundled with esbuild)
- Amazon API Gateway (REST API)
- Amazon DynamoDB (single table, on-demand billing)
- AWS SAM (infrastructure as code)
### Frontend
- React
- Hosted on S3 + CloudFront
### Auth
- Amazon Cognito
 
## Deploy
Run build in shared layer if there are changes.
 
```
cd <project-root>/layers/shared
npm install
npm run build
cd <project-root>
npm install
sam build
npm run test
sam deploy --guided
```

Or run `npm run build` in project root. Build script install and build shared layer before running sam build.<br/>
Run `sam deploy --config-env dev` to deploy to dev only.

## Run locally
Must have Docker Desktop installed to simulate Lambda runtime environment.
```
npm install
sam build
npm run test
sam local start-api
```
 
## Test
 
Use Postman or curl against the API URL printed in the deploy output.

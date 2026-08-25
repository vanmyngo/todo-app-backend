# Todo App
 
A simple CRUD to-do app built on AWS, using only always-free tier services.
 
## Tech Stack
 
**Backend**
- AWS Lambda (Node.js 24, TypeScript, bundled with esbuild)
- Amazon API Gateway (REST API)
- Amazon DynamoDB (single table, on-demand billing)
- AWS SAM (infrastructure as code)
**Frontend**
- React (planned)
- Hosted on S3 + CloudFront
**Auth**
- Amazon Cognito (planned)
## MVP Features
 
- Create a to-do
- List all to-dos
- Get a single to-do by id
- Update a to-do (edit text or mark complete)
- Delete a to-do
- Public API reachable over HTTPS
## Future Features
 
- User accounts and login (Cognito)
- Per-user private to-do lists
- Due dates and priority levels
- Frontend deployed to a public URL
- CORS support for browser-based frontend
## Project Structure
 
```
src/
├── create_todo/
├── get_todos/
├── list_todos/
├── update_todo/
└── delete_todo/
template.yaml
package.json
tsconfig.json
```
 
## Deploy
 
```
npm install
sam build
sam deploy --guided
```
 
## Test
 
Use Postman or curl against the API URL printed in the deploy output.
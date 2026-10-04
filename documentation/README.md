# ƒorteƒy documentation

How to run the app is in the [main README](../README.md#running-locally), and
how changes get made, tested and merged is in
[CONTRIBUTING.md](../CONTRIBUTING.md). This folder has the rest:

| document | what it covers |
|---|---|
| [api.md](api.md) | every API route, what it takes and what it sends back |
| [database_schema.md](database_schema.md) | the tables, their columns, and how they relate |
| [app_structure.md](app_structure.md) | where things live: the Flask app, the React app, the tests |
| [feature_list.md](feature_list.md) | the features the project set out to build |
| [user_stories.md](user_stories.md) | the user stories the project was planned from in 2023 |
| [Deploying to Render](#deploying-to-render) | below |


## Deploying to Render

Render's own guides cover the basics of [Render.com]: creating a Postgres
database, creating a web service, and reading deploy logs. This is what
ƒorteƒy's web service needs.

From the [Dashboard], click on the "New +" button in the navigation bar, and
click on "Web Service" to create the application that will be deployed.

Look for the name of the application you want to deploy, and click the "Connect"
button to the right of the name.

Now, fill out the form to configure the build and start commands, as well as add
the environment variables to properly deploy the application.

### Part A: Configure the Start and Build Commands

Start by giving your application a name.

Leave the root directory field blank. By default, Render will run commands from
the root directory.

Make sure the Environment field is set to "Python 3", the Region is set to
the location closest to you, and the Branch is set to "main".

Render takes the Python version from `.python-version` in the repository root
(3.12, the version CI tests on). Without that file, a service
created before November 2023 falls back to Python 3.7.10, which is
end-of-life: cryptography and boto3 warn on every build that they are dropping
it, and pip installs a urllib3 that botocore does not support there. A
`PYTHON_VERSION` environment variable on the service would override the file,
so leave it unset.

The frontend is built with Node.js, whose version comes from `.node-version`
(24) in the same way. Without it, an older service builds with Node 14, which
cannot run Vite. A `NODE_VERSION` environment variable would override the file
too. The deploy log shows which version was used, in a line like
`Using Node.js version 24.x.x`.

Next, add your Build command. This is a script that should include everything
that needs to happen _before_ starting the server.

Enter the following command into the Build field, all in one line:

```shell
# build command - enter all in one line
npm install --prefix react-app &&
npm run build --prefix react-app &&
pip install -r requirements.txt &&
flask db upgrade
```

`requirements.txt` includes the Postgres driver (psycopg 3), so the build no
longer needs the separate `pip install psycopg2` it used to have. An older
service whose build command still has it works too; the extra package just goes
unused.

This script will install dependencies for the frontend, and run the build
command in the __package.json__ file for the frontend, which builds the React
application. Then, it will install the dependencies needed for the Python
backend and run the migrations.

**Do not put `flask seed all` in the build command.** The build command runs
on every deploy, and re-seeding on every deploy is how the production database
used to get wiped. Seed the database once instead, after the first successful
deploy, from the "Shell" tab of your Render web service:

```shell
flask seed all
```

`flask seed all` skips itself when the database already has data, so running it
again is harmless. To throw everything away and start over from fresh seed data
(this deletes every album, song, and playlist users have created), run:

```shell
flask seed undo && flask seed all
```

Now, add your start command in the Start field:

```shell
# start script
gunicorn app:app
```

### Part B: Add the Environment Variables

Click on the "Advanced" button at the bottom of the form to configure the
environment variables the application needs. These are the production
counterparts of your local __.env__ file, which is not in source control.

Click on "Add Environment Variable" to start adding all of the variables you
need for the production environment.

Add the following keys and values in the Render GUI form:

- SECRET_KEY (click "Generate" to generate a secure secret for production)
- FLASK_ENV production (the app's own switch for production behaviour, such
  as the Postgres schema and secure cookies. Flask 3 itself ignores it; locally,
  `.flaskenv` sets `FLASK_DEBUG=1` instead)
- FLASK_APP app
- SCHEMA (your unique schema name, in snake_case)
- S3_BUCKET, S3_KEY and S3_SECRET, for song uploads (see
  [S3 credentials](../CONTRIBUTING.md#s3-credentials))
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, only if you want Google login (see
  [Setting up Google Login](../README.md#setting-up-google-login-optional))

In a new tab, navigate to your dashboard and click on your Postgres database
instance.

Add the following keys and values:

- DATABASE_URL (copy value from Internal Database URL field)

_Note: when a change adds a variable to `.env.example`, add it to the Render
service too, or the next deploy runs without it._

Next, choose "Yes" for the Auto-Deploy field. This will re-deploy your
application every time you push to main.

Now, you are finally ready to deploy! Click "Create Web Service" to deploy your
project. The deployment process will likely take about 10-15 minutes if
everything works as expected. You can monitor the logs to see your build and
start commands being executed, and see any errors in the build process.

When deployment is complete, open your deployed site and check to see if you
successfully deployed your Flask application to Render! You can find the URL for
your site just below the name of the Web Service at the top of the page.

[Render.com]: https://render.com/
[Dashboard]: https://dashboard.render.com/

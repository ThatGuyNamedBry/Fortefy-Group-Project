# Contributing to ƒorteƒy

To get the app running on your machine first, follow
[Running locally](README.md#running-locally) in the README.

## How a change lands

1. **Start from an issue.** Pick one from the
   [issue list](https://github.com/ThatGuyNamedBry/Fortefy-Group-Project/issues),
   or open one for what you want to change.
2. **Branch off an up-to-date `main`**, named after the issue:
   `issue-<number>-<a-few-words>`, for example `issue-109-edit-playlist`.
3. **Open a pull request into `main`.** Say which issue it is for, and write
   `Closes #<number>` when it finishes the issue, so merging closes it.
4. **CI has to pass.** GitHub Actions (`.github/workflows/ci.yml`) runs on every
   pull request:
   - **Backend:** ruff and the API tests.
   - **Migrations:** every migration and the seeds, on Postgres in production
     mode, the way Render runs them.
   - **Frontend:** ESLint, Prettier, the React tests and a production build.
5. **Merge** with a merge commit. Render deploys `main` automatically whenever
   it changes.

The `dev` branch is left over from the original 2023 project, when features
were merged into `dev` and `dev` into `main`. It hasn't changed since
September 2023, so don't branch from it or merge into it.

## Tests, linting and formatting

Install the development tools once:

```bash
pip install -r requirements-dev.txt
npm install --prefix react-app
```

`requirements-dev.txt` installs everything in `requirements.txt`, plus the test
and lint tools. Then:

| what | command |
|---|---|
| API tests, with coverage | `pytest --cov` |
| Python lint | `ruff check .` |
| Python format | `ruff format .` |
| React tests | `npm test --prefix react-app` (`npm run test:watch --prefix react-app` keeps them running) |
| JavaScript lint | `npm run lint --prefix react-app` |
| JavaScript / CSS format | `npm run format --prefix react-app` (`format:check` only checks) |

The API tests use an in-memory SQLite database and a stand-in for S3, so they
need no `.env`, network or AWS credentials.

To have the formatters and linters run on every commit, run `pre-commit install`
once in your clone. `pre-commit run --all-files` runs them on everything.

## Seed data

`flask seed all` fills an empty database with:

- **Users:** Demo (`demo@aa.io`), Marnie, Bobbie, Tune Guru and Music Lvr, each
  with the password `password`. The login modal's "Continue with Demo User"
  button logs in as Demo.
- **The library:** 10 albums and 32 songs. They belong to a sixth account,
  "Fortefy", which nobody can log in as, so visitors can't delete or change
  them. To try editing, uploading or deleting, create an album as Demo first.
- **Playlists:** 5, two of them Demo's.

The seeded songs and covers stream from the public S3 bucket `fortefy-song-url`.
Deleting a seeded song never deletes its file.

`flask seed all` does nothing if the database already has users. To start over,
`flask seed undo` deletes **everything**, including what users have created, and
then `flask seed all` seeds again:

```bash
flask seed undo && flask seed all
```

Locally the database is SQLite, at `instance/dev.db`. After switching to a
branch that adds a migration, run `flask db upgrade` again.

## S3 credentials

Only uploading a song needs S3. Everything else works without it, seeded songs
included. Uploads go to the bucket named in your `.env`:

```bash
S3_BUCKET=your-bucket-name
S3_KEY=your-access-key-id
S3_SECRET=your-secret-access-key
```

The team's credentials are not in the repository; ask a maintainer for them.
Or use a bucket of your own:

1. **Create a bucket** in the [S3 console](https://console.aws.amazon.com/s3/).
   Any region works.
2. **Allow public-read uploads.** The app uploads each song with a `public-read`
   ACL, so the browser can play it straight from S3:
   - Under **Object Ownership**, choose **ACLs enabled**.
   - Under **Block Public Access**, untick the two settings about ACLs.
3. **Create an IAM user** with access to just that bucket's objects:
   `s3:PutObject`, `s3:PutObjectAcl` and `s3:DeleteObject` on
   `arn:aws:s3:::your-bucket-name/*`.
4. **Create an access key** for that user, and put its ID and secret in
   `S3_KEY` and `S3_SECRET`.

Uploaded files are named `<32 hex characters>.<extension>`, at the root of the
bucket. When upload or delete fails, the server log says why.

## Keeping the docs current

- **Routes:** a change to a route, its body, or the fields it sends back goes in
  [documentation/api.md](documentation/api.md) in the same pull request.
- **Database:** a change to a model's columns goes in
  [documentation/database_schema.md](documentation/database_schema.md).
- **Features:** a change to what users can do goes in the README's
  [Key features](README.md#key-features).

`tests/test_docs.py` fails when the API or schema doc no longer matches the
code, or when a link between the docs breaks.

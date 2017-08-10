[![Build Status](https://travis-ci.org/dougmoscrop/tf-output.svg?branch=master)](https://travis-ci.org/dougmoscrop/tf-output)
[![Coverage Status](https://coveralls.io/repos/github/dougmoscrop/tf-output/badge.svg)](https://coveralls.io/github/dougmoscrop/tf-output)

# tf-output

Fetches terraform outputs and lets you:

- print them to stdout in different formats
- call another command with them exposed in the environment
- export them to your current shell

## Getting Started

You need to install this module and then run it's command from somewhere that has a property initialized terraform environment.

## Install

`npm install -g tf-output`

## Usage

Assuming you have a module called *database.tf* with an output called `DATABASE_URL` in a folder called terraform/database and you have already set up terraform...

### Examples
```bash
tf-output database
```

Would print out something like:

> DATABASE_URL="http://database.totallysecure.com"

And:

```bash
tf-output database -- node src/app.js
```

Would call `node src/app.js` with the `DATABASE_URL` available in the process environment.

You can also

```bash
export $(tf-output database)
```
Which will populate outputs in to your current shell.

## Configuration

### Module

`-m` or `--module` specifies which module to obtain output from. `-m` alone uses the `dir` name as the value. So

```bash
tf-output api -m
```

calls `terraform output -m api` in `terraform/api`

### Output Format

`-f` or `--format` allows you to specify an alternate output format, currently `json` is supported. This flag is ignored if a command is specified.

### Backend Initialization

`-a` or `--auto-init` allows you to auto-initialize terraform (`terraform init`) prior to copying outputs.

`-g` or `--auto-init-get` will pull down modules mentioned in the root module during auto-initialization.

## Advanced Configuration

### Plan Check

`-c` or `--check-plan` checks if terraform plan has any unapplied changes (and aborts if it does).

### Path Template

`-p` or `-path` specifies a *path template*. tf-output looks for modules according to a path template, which by default is `terraform/{dir}` - so `tf-output api database` would look for a module in two directories:

- terraform/database
- terraform/api

You can use more complex path templates. Imagine you deploy your app using the following command:

`deploy --stage=dev --region=us-east-1`

You might organize your terraform definitions in a number of ways and you can customize where tf-output looks to suit your needs.

`tf-output database -p {stage}/{region}/terraform/{dir}`

This command would fail, because while it knows the module you are trying to load, it doesn't know what `stage` and `region` should be.

You can specify them:

`tf-output database api -p {stage}/{region}/terraform/{dir} --stage=dev --region=us-east-1`

This would cause tf-output to load modules from:

- `dev/us-east-1/terraform/api`
- `dev/us-east-1/terraform/database`

If you run a command through tf-output, it will *look ahead* for substitution values. This works the same:

`tf-output database api -p {stage}/{region}/terraform/{dir} -- deploy --stage=dev --region=us-east-1`

Except instead of printing the outputs out to stdout, it would exec `deploy --stage=dev --region=us-east-1` with environment variables set, and the path template would still be substituted wtih the right stage and region. This saves you havin to repeat region, stage, etc.

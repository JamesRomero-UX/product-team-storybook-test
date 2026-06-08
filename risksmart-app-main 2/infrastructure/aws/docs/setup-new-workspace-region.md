# Setting up a new workspace region account

## Pre-requisites

If it's in a new AWS Account or somewhere a statefile doesn't already exist you'll need to set that up first, see the [setup-new-account.md](./setup-new-account.md) doc.

## Setup

Really simple, just add a new `.tfvars` file to `workspaces/app-environments/envs`.

## Pipelines

Update the `auto` and `manual` tofu workspaces files to include or remove particular workspaces.

Keep in mind there are other tofu files there that do not deal with workspaces, don't worry about those.

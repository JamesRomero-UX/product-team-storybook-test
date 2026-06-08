# Local dev

The TRPC server can be run within docker, or directly by running

```sh
pnpm dev:server
```

# Syncing data to permit to fix permissions

POST

```json
{
  "syncSettings": [
    {
      "tenant": "MultiTenant",
      "orgKeys": [
        "org_Wry1ylTIzMeSDBkT",
        "org_weM43nU7Ac58JzHL",
        "org_o2dH1p42UjGrBaYU",
        "org_Qshp7tYsxxAWwhVa"
      ]
    }
  ]
}
```

to

localhost:2021/trpc/admin.initPermit

# Getting access to permit

Create new gmail account
Personal use
Name
DoB
'Use an existing email' Its a link at the bottom of that page
Continue
Use risksmart.com email address

Then Marcell can add you to the RS account.


# Dev Workflow

In order for the changes to the package to take effect run `pnpm docker:build` in this package or `trpc:docker:build` in the root of the project.

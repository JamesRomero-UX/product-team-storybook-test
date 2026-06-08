# todo

## Features

- [L] Ingest task versions
- [M] customer configuration
- [M] trigger full ingestion (without change detection)
- [L] Figure out how we get the ID'd of the chapters to filter on (relates to customer configuration). Need to fully ingest everything from the rulebook and make it available Somewhere. this feels like a seperate process.

## Enhancements

- How do we update ingestion runs sequentially (Enabling us to run change detection tasks sequentially) without losing writes from another process?
- DD dashboard

## Refactors

- I have a feeling that the use cases / domain services are getting a little muddy. Need to review them for best practice and ensure theyre not tightly coupled to ascent where able.
- Task storage adaptor needs to become something like intermediate storage adaptor
- Fix naming of RawExternalObligationBuilder -> NewRawExternalObligationBuilder
- Fix naming of services/rulebook-ingestion/src/use-cases/ingest-ascent-rulebooks.ts to services/rulebook-ingestion/src/use-cases/ingest-ascent-obligations.ts
- Make integration test more robust

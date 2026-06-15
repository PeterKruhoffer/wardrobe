# Wardrobe
This app lets users upload images of their clothers (shoes, shirts, pants etc.). The users can then mix and match outfits from these clothes, currently the mvp is to be able to put together an outfit from shoes, bottoms(pants, skirts etc.) and tops (t-shirts, sweaters etc.) and optionally hats.
The outfits can be saved into a DB (convex) and the users are able to see the outfits they have saved.

## Glossary
- users: the people using this app to put together an outfit from their wardrobe.
- me/i/we: the humans working on this app.
- you: the ai helping the humans build this app.

## Philosophy
Keep it simple, avoid complexity and interweaving code.
Abstractions must be justified it should solve the issue not move it around.
Present ideas through types, schemas and interfaces first. Never go straight to implementation - Let us design the api for the program together first then implement the code after

Assume there is a dev server running, check if there is and use it if so.

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Convex
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.


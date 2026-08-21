## AI TOOLS USED

As for my AI workflow, I used 2 tools for this - ChatGPT, and Claude Code (running inside VSCode).

## How AI Sped up my work

My first prompt is providing the initial context about a take home assignment with a 4-hour time limit. Go through the entire instructions and plan it together with me. Then I pasted the instructions as provided on the candidate assessments link. Ater ChatGPT provided the feedback, it gave me the implementation plan. I also told ChatGPT that I will be using Claude Code for this and that it will help me make the prompts to send to Claude Code.

The implementation plan includes subdividing the work into 4 phases:

* Plan Phase - plan the tech stack, database schema, what should be built and not
* Initial Implementation Phase - Create the basic project scaffolding, install the dependencies, and setting up Supabase. Start with the dashboard, show the users on the users dropdown, pulling the data from Supabase. Create the document, adding the rich text editor and auto-saved feature.
* Adding other features such as Sharing, and Import. Manual testing, fix the bugs or UI issues found, and polishing.
* Finishing touhces - adding the `access.test`, push to my personal Github repo, sync my Github repo with Vercel and deployed the project in Vercel. Edited the README.md, created ARCHITECTURE, AI_WORKFLOW, and SUBMISSION md files.

So ChatGPT acts as my planning partner, I knew I would use Next.js and that's always been my default, but picking with rich editors to use, picking Supabase over SQLite gives me a hosted Postgres database that is accessible in the cloud, etc. ChatGPT also helps me make the promps, and also assess the responses provided by Claude resulting from the promps.

Claude Code acts as my developer, it develops everything.

## AI generated output I changed

At first the Rich Text editor was not working and there was a weird focus border whenever I tried typing on the text editor. The document title textbox was not obvious as first as it has the same color as the entire background (black). Cursor was not visible on both the title textbox and Rich text editor. I asked AI to improve all UX issues I found.

## How I verified correctness, UX quality, and implementation reliability

As a Frontend Developer, I looked at the overall UI and made sure that all the basics were covered hence the things I asked AI to improve such as the import button visibility, the weird focus border had to be removed, initial clicking on the Rich text editor does not show the current text cursor, etc. I did not totally rely on AI to do the testing. I had to test everything manually as well. I had to go over with the instructions with ChatGPT too to make sure correctness is achieved.
# Why does this directory exist?

**It is not part of the game.** It contains no site content and nothing here is
served to users. It exists purely to work around a Netlify misconfiguration.

## The problem

The Netlify site's **Base directory** field (Site configuration → Build & deploy
→ Continuous deployment → Build settings) was set to this branch's name,
`claude/deploy-to-netlify-518LD`, instead of being left empty. The branch name
almost certainly got typed into the wrong field — "Base directory" sits right
next to "Branch to deploy" in that form.

Netlify `cd`s into the base directory *before* it reads any configuration, so
every build failed during config parsing:

```
When resolving config file /opt/build/repo/netlify.toml:
Base directory does not exist: /opt/build/repo/claude/deploy-to-netlify-518LD
```

This cannot be fixed from the root `netlify.toml`. Setting `base = "."` there
does nothing, because the base directory is what Netlify uses to *locate* the
config file in the first place — the file can't override the setting that finds
it.

## The workaround

Making the directory exist lets the build get past config parsing. The
`netlify.toml` here sets `publish = "../../"`, which resolves relative to the
base directory:

```
/opt/build/repo/claude/deploy-to-netlify-518LD/../../  ->  /opt/build/repo
```

So the real site at the repo root gets published as normal.

## How to remove this properly

1. In Netlify: **Site configuration → Build & deploy → Continuous deployment →
   Build settings → Edit settings**, clear the **Base directory** field so it is
   empty. Confirm the branch name lives in **Branch to deploy** instead.
2. Delete this entire `claude/` directory from the repo.
3. The root `netlify.toml` takes over and publishes the repo root directly.

Leaving this in place works, but it means the deploy depends on a directory
named after a git branch, which will confuse whoever reads it next.

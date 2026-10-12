<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep TanStack file-based routes as thin metadata-and-page wrappers around feature modules, so every workspace section has a shareable URL.
- Keep all demonstration interactions in the shared React context or feature state without browser persistence or connected services, so the frontend preview cannot imply real operations.
- Define semantic visual tokens and reusable layouts in src/styles.css, so feature components follow one coherent design system.
- Keep sample student content in src/data/demo.ts and label simulated service results, so demonstration data is distinct from real data.
- Signed-in role lives in the shared demo context only (no storage), so role access stays a frontend simulation.

import { Suspense } from "react";
import SearchConsole from "./SearchConsole";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;

  return (
    <Suspense
      fallback={
        <SearchConsole
          initialSuggestions={[]}
          initialSuggestionQuery={params?.suggestQuery || ""}
          initialReport={null}
        />
      }
    >
      <SearchConsole
        initialSuggestions={[]}
        initialSuggestionQuery={params?.suggestQuery || ""}
      />
    </Suspense>
  );
}

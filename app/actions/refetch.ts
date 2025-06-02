'use server'

import { fetchAndSaveArticles } from "@/utils/fetchAndSaveArticles"

export async function refetchArticles() {
  await fetchAndSaveArticles()
}

import { fetchAndSaveArticles } from "../utils/fetchAndSaveArticles";
import { translateWithOpenAI } from "../utils/translateWithOpenAi";


(async () => {
   await translateWithOpenAI();
  // ...do something with x
})();
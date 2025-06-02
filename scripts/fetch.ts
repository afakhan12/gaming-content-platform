import { fetchAndSaveArticles } from "../utils/fetchAndSaveArticles";
import { translateWithOpenAI } from "../utils/translateWithOpenAI";


(async () => {
   await translateWithOpenAI();
  // ...do something with x
})();
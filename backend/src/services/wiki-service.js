import WikiArticleRepository from "../repository/wikiArticle-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";

class WikiService {
  constructor() {
    this.wikiRepo  = new WikiArticleRepository();
    this.auditRepo = new AuditLogRepository();
  }

  async createArticle(data, performedBy, performedByName) {
    try {
      const article = await this.wikiRepo.create({ ...data, author: performedBy, authorName: performedByName, lastEditedBy: performedBy, lastEditedByName: performedByName });
      await this.auditRepo.create({ performedBy, performedByName, action: "CREATE", entity: "WikiArticle", entityId: article._id, entityLabel: article.title, description: `Created wiki article: "${article.title}"` });
      return article;
    } catch (e) { console.error("WikiService.createArticle:", e); throw e; }
  }

  async getAllArticles(category) {
    try { return await this.wikiRepo.getAll(category); }
    catch (e) { console.error("WikiService.getAllArticles:", e); throw e; }
  }

  async getPublishedArticles(category) {
    try { return await this.wikiRepo.getPublished(category); }
    catch (e) { console.error("WikiService.getPublishedArticles:", e); throw e; }
  }

  async getArticleBySlug(slug) {
    try {
      const article = await this.wikiRepo.getBySlug(slug);
      if (!article) throw new Error("Article not found.");
      if (article.isPublished) await this.wikiRepo.incrementViews(article._id);
      return article;
    } catch (e) { console.error("WikiService.getArticleBySlug:", e); throw e; }
  }

  async getArticleById(id) {
    try {
      const article = await this.wikiRepo.getById(id);
      if (!article) throw new Error("Article not found.");
      return article;
    } catch (e) { console.error("WikiService.getArticleById:", e); throw e; }
  }

  async updateArticle(id, data, performedBy, performedByName) {
    try {
      let updated;
      // If content is being changed, save version history
      if (data.content) {
        updated = await this.wikiRepo.addVersion(id, data.content, performedBy, performedByName, data.changeNote || "");
        // Update other fields too
        const { content, changeNote, ...rest } = data;
        if (Object.keys(rest).length) {
          updated = await this.wikiRepo.findByIdandUpdate(id, rest);
        }
      } else {
        updated = await this.wikiRepo.findByIdandUpdate(id, data);
      }
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "WikiArticle", entityId: id, description: `Updated wiki article` });
      return updated;
    } catch (e) { console.error("WikiService.updateArticle:", e); throw e; }
  }

  async deleteArticle(id, performedBy, performedByName) {
    try {
      const art = await this.wikiRepo.getById(id);
      if (!art) throw new Error("Article not found.");
      await this.wikiRepo.findByIdandDelete(id);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "WikiArticle", entityId: id, entityLabel: art.title, description: `Deleted wiki article: "${art.title}"` });
      return { success: true };
    } catch (e) { console.error("WikiService.deleteArticle:", e); throw e; }
  }

  async searchArticles(query) {
    try { return await this.wikiRepo.search(query); }
    catch (e) { console.error("WikiService.searchArticles:", e); throw e; }
  }

  async vote(id, helpful) {
    try { return await this.wikiRepo.vote(id, helpful); }
    catch (e) { console.error("WikiService.vote:", e); throw e; }
  }

  async getPopular() {
    try { return await this.wikiRepo.getPopular(10); }
    catch (e) { console.error("WikiService.getPopular:", e); throw e; }
  }

  async getCategoryStats() {
    try { return await this.wikiRepo.getCategoryStats(); }
    catch (e) { console.error("WikiService.getCategoryStats:", e); throw e; }
  }
}

export default WikiService;

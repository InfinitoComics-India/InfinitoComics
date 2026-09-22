import HRDocumentRepository from "../repository/hrDocument-repository.js";
import AuditLogRepository from "../repository/auditLog-repository.js";
import NotificationRepository from "../repository/notification-repository.js";

class HRDocumentService {
  constructor() {
    this.docRepo          = new HRDocumentRepository();
    this.auditRepo        = new AuditLogRepository();
    this.notificationRepo = new NotificationRepository();
  }

  async upload(data, performedBy, performedByName) {
    try {
      const doc = await this.docRepo.create({ ...data, uploadedBy: performedBy });
      await this.auditRepo.create({ performedBy, performedByName, action: "UPLOAD", entity: "HRDocument", entityId: doc._id, entityLabel: doc.fileName, description: `Uploaded ${doc.category} for employee` });
      await this.notificationRepo.create({ recipientId: data.employeeId, recipientModel: "Employee", type: "system", title: "New Document Available", message: `A new document (${doc.category.replace("_"," ")}) has been uploaded to your profile.`, link: "/hr/documents" });
      return doc;
    } catch (e) { console.error("HRDocumentService.upload:", e); throw e; }
  }

  async getByEmployee(employeeId) {
    try { return await this.docRepo.getByEmployee(employeeId); }
    catch (e) { console.error("HRDocumentService.getByEmployee:", e); throw e; }
  }

  async getExpiringSoon(days) {
    try { return await this.docRepo.getExpiringSoon(days); }
    catch (e) { console.error("HRDocumentService.getExpiringSoon:", e); throw e; }
  }

  async getAllForAdmin() {
    try { return await this.docRepo.getAllForAdmin(); }
    catch (e) { console.error("HRDocumentService.getAllForAdmin:", e); throw e; }
  }

  async updateDocument(id, data, oldFileUrl, performedBy, performedByName) {
    try {
      // If new file provided, version bump
      if (data.fileUrl && oldFileUrl && data.fileUrl !== oldFileUrl) {
        await this.docRepo.addVersion(id, oldFileUrl);
      }
      const updated = await this.docRepo.findByIdandUpdate(id, data);
      await this.auditRepo.create({ performedBy, performedByName, action: "UPDATE", entity: "HRDocument", entityId: id, description: `Updated document` });
      return updated;
    } catch (e) { console.error("HRDocumentService.updateDocument:", e); throw e; }
  }

  async deleteDocument(id, performedBy, performedByName) {
    try {
      const doc = await this.docRepo.getById(id);
      if (!doc) throw new Error("Document not found.");
      await this.docRepo.findByIdandDelete(id);
      await this.auditRepo.create({ performedBy, performedByName, action: "DELETE", entity: "HRDocument", entityId: id, entityLabel: doc.fileName, description: `Deleted document: ${doc.fileName}` });
      return { success: true };
    } catch (e) { console.error("HRDocumentService.deleteDocument:", e); throw e; }
  }
}

export default HRDocumentService;

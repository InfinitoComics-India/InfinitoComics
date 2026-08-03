import ResearchApplication from '../models/ResearchApplication.js';

// POST /research-application — submit a researcher application
export const createApplication = async (req, res) => {
  try {
    const { fullName, topics, email, details } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required.' });
    }

    const application = await ResearchApplication.create({ fullName, topics, email, details });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    console.error('Error creating research application:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// GET /research-application — get all applications (admin only)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await ResearchApplication.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching research applications:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /research-application/:id — delete an application (admin only)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    await ResearchApplication.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Application deleted.' });
  } catch (error) {
    console.error('Error deleting research application:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

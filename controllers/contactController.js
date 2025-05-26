const Contact = require('../models/contact');
const { sendContactEmail } = require('../config/sendEmail');

/**
 * Submit contact form
 */
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Save to database
    const newContact = await Contact.create({
      name,
      email,
      phone,
     
      service,
      message
    });

    // Send email notification
    await sendContactEmail({
      name,
      email,
      phone,
     
      service,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: newContact
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again.'
    });
  }
};

/**
 * Get all contacts (admin only)
 */
exports.getAllContacts = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Add search functionality
    const searchQuery = {};
    if (req.query.search) {
      searchQuery.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        // { company: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Add sorting
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest first
    }

    const contacts = await Contact.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
};

/**
 * Get single contact by ID (admin only)
 */
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact'
    });
  }
};

/**
 * Update contact (admin only)
 */
exports.updateContact = async (req, res) => {
  try {
    const { name, email, phone, service, message, status } = req.body;
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
       
        service,
        message,
        status
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact'
    });
  }
};

/**
 * Delete contact (admin only)
 */
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact'
    });
  }
};

/**
 * Get contact statistics (admin only)
 */
exports.getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          newThisMonth: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", new Date(new Date().setDate(1))] },
                1,
                0
              ]
            }
          },
          byService: {
            $push: {
              service: "$service",
              count: 1
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalContacts: 1,
          newThisMonth: 1,
          services: {
            $reduce: {
              input: "$byService",
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    existing: {
                      $filter: {
                        input: "$$value",
                        as: "s",
                        cond: { $eq: ["$$s.service", "$$this.service"] }
                      }
                    }
                  },
                  in: {
                    $concatArrays: [
                      {
                        $filter: {
                          input: "$$value",
                          as: "s",
                          cond: { $ne: ["$$s.service", "$$this.service"] }
                        }
                      },
                      {
                        $cond: [
                          { $gt: [{ $size: "$$existing" }, 0] },
                          {
                            $map: {
                              input: "$$existing",
                              as: "e",
                              in: {
                                service: "$$e.service",
                                count: { $add: ["$$e.count", 1] }
                              }
                            }
                          },
                          [{ service: "$$this.service", count: 1 }]
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalContacts: 0,
        newThisMonth: 0,
        services: []
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
};
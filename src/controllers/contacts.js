import { 
    getAllContacts, 
    getContactById,
    createContact,
    deleteContact,
    updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { getEnvVar } from '../utils/getEnvVar.js';


export const getContactsController = async (req, res) => {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);
    const successStatus = 200;

    const contacts = await getAllContacts({
        userId,
        page,
        perPage,
        sortBy,
        sortOrder,
        filter,
    });

    return res.status(successStatus).json({
        status: successStatus,
        message: 'Successfully found contacts!',
        data: contacts,
    });
};

export const getContactByIdController = async (req, res) => {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const { contactId } = req.params;
    const contact = await getContactById(userId, contactId);
    const successStatus = 200;
    const errorStatus = 404;
    
    if (!contact) {
        return res.status(errorStatus).json({
            status: errorStatus,
            message: `Contact with id ${contactId} not found`,
            data: null,
        });
    }

    return res.status(successStatus).json({
        status: successStatus,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
    });
};

export const createContactController = async (req, res) => {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const photo = req.file;
    let photoUrl;

    if (photo) {
        if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
            photoUrl = await saveFileToCloudinary(photo);
        } else {
            photoUrl = await saveFileToUploadDir(photo);
        }
    }

    const contact = await createContact(userId, {
        ...req.body,
        photo: photoUrl,
    });
    const successStatus = 201;

    return res.status(successStatus).json({
        status: successStatus,
        message: 'Successfully created a contact!',
        data: contact,
    });
};

export const deleteContactController = async (req, res) => {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const { contactId } = req.params;
    const deleted = await deleteContact(userId, contactId);
    const successStatus = 204;
    const errorStatus = 404;

    if (!deleted) {
        return res.status(errorStatus).json({
            status: errorStatus,
            message: `Contact with id ${contactId} not found`,
            data: null,
        });
    }

    return res.sendStatus(successStatus);
};

export const upsertContactController = async (req, res) => {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const { contactId } = req.params;

    const result = await updateContact(userId, contactId, req.body, {
        upsert: true,
    });

    const errorStatus = 404;

    if (!result) {
        return res.status(errorStatus).json({
            status: errorStatus,
            message: `Contact with id ${contactId} not found`,
            data: null,
        });
    }

    const successStatus = result.isNew ? 201 : 200;

    return res.status(successStatus).json({
        status: successStatus,
        message: `Successfully upserted a contact!`,
        data: result.contact,
    });
};

export const patchContactController = async (req, res) => {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authorized' });

    const { contactId } = req.params;
    const photo = req.file;
    let photoUrl;

    if (photo) {
        if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
            photoUrl = await saveFileToCloudinary(photo);
        } else {
            photoUrl = await saveFileToUploadDir(photo);
        }
    }

    const updated = await updateContact(userId, contactId, {
        ...req.body,
        photo: photoUrl,
    });

    const successStatus = 200;
    const errorStatus = 404;

    if (!updated) {
        return res.status(errorStatus).json({
            status: errorStatus,
            message: `Contact with id ${contactId} not found`,
            data: null,
        });
    }

    return res.status(successStatus).json({
        status: successStatus,
        message: `Successfully patched a contact!`,
        data: updated,
    });
};

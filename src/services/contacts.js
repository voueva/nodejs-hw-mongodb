
import mongoose from 'mongoose';

import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from "../constants/index.js";

export const getAllContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = 'createdAt',
  filter = {},
}) => {
  if (!userId) throw new Error('userId is required');

  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();

  contactsQuery.where('userId').equals(userId);

  if (filter.name) {
    contactsQuery.where('name').includes(filter.name);
  }
  if (filter.phoneNumber) {
    contactsQuery.where('phoneNumber').lte(filter.phoneNumber);
  }
  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }
  if (filter.isFavourite) {
    contactsQuery.where('isFavourite').lte(filter.isFavourite);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (userId, contactId) => {
  if (!userId) throw new Error('userId is required');

  const contact = await ContactsCollection.findOne({
    _id: contactId,
    userId,
  }).exec();
  return contact;
};

export const createContact = async (userId, payload) => {
  if (!userId) throw new Error('userId is required');

  const doc = {
    ...payload,
    userId,
  };

  const contact = await ContactsCollection.create(doc);
  return contact;
};

export const deleteContact = async (userId, contactId) => {
  if (!userId) throw new Error('userId is required');

  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  }).exec();

  return contact;
};

export const updateContact = async (userId, contactId, payload, options = {}) => {
  if (!userId) throw new Error('userId is required');

  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

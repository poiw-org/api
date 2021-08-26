import client from '../providers/mongo.providers';
import Item from '../entities/item';
import { customAlphabet } from 'nanoid';

const generator = customAlphabet('0123456789', 12);

export default {
  async getById(id: string): Promise<Item> {
    await client.connect();
    const { _id, title, description, shelf, checkIn, checkOut, editedBy } =
      await client.db().collection('items').findOne({ _id: id });

    return new Item(
      _id,
      title,
      description,
      shelf,
      checkIn,
      checkOut,
      editedBy,
    );
  },

  async searchItems(query?: string, shelf?: string): Promise<object[]> {
    await client.connect();

    return await client
      .db()
      .collection('items')
      .find(
        shelf
          ? { shelf: shelf }
          : {
              $or: [
                { _id: new RegExp(query, 'i') },
                { title: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') },
                { shelf: new RegExp(query, 'i') },
                { tags: new RegExp(query, 'i') },
              ],
            },
      )
      .toArray();
  },

  async getLatestItems(): Promise<object[]> {
    await client.connect();
    return await client
      .db()
      .collection('items')
      .find()
      .sort({ checkIn: -1 })
      .limit(10)
      .toArray();
  },

  async createItem(item: any): Promise<boolean | string> {
    await client.connect();
    const isOnly12Numbers = /^[0-9]{12}$/.test(item._id);

    if (!isOnly12Numbers)
      return 'The ID can only contain a sequence of 12 numbers.';

    if (item.shelf) {
      item.shelf = item.shelf.toUpperCase();
      const shelfIsInCorrectFormat = /^[0-9]{1,2}[A-Z]{1,2}$/.test(item.shelf);
      if (!shelfIsInCorrectFormat)
        return 'The shelf referer must start from a number and end in one or two letters. For example 9A or 11C or 2AB.';
    }

    item._id = item._id.toString();

    const exists = await client
      .db()
      .collection('items')
      .find({ _id: item._id })
      .toArray();

    if (exists.length > 0 || !item._id || !item.title) return false;

    item.checkIn = new Date();

    await client.db().collection('items').insert(item);
    return true;
  },

  async updateItem(item: any): Promise<boolean | string> {
    await client.connect();

    const exists = await client
      .db()
      .collection('items')
      .findOne({ _id: item._id });

    if (exists?.length == 0) return false;

    if (item.shelf) {
      item.shelf = item.shelf.toUpperCase();
      const shelfIsInCorrectFormat = /^[0-9]{1,2}[A-Z]{1,2}$/.test(item.shelf);
      if (!shelfIsInCorrectFormat)
        return 'The shelf referer must start from a number and end in one or two letters. For example 9A or 11C or 2AB.';
    }

    if (!Array.from(exists.editedBy)?.includes(item.editedBy))
      item.editedBy = [...Array.from(exists.editedBy), item.editedBy];
    else item.editedBy = exists.editedBy;

    await client
      .db()
      .collection('items')
      .updateOne({ _id: item._id }, { $set: item });
    return true;
  },

  async deleteItem(item: any): Promise<boolean> {
    await client.connect();

    await client.db().collection('items').deleteOne({ _id: item._id });
    return true;
  },

  async checkOut(item: any): Promise<boolean> {
    await client.connect();

    const exists = await client
      .db()
      .collection('items')
      .findOne({ _id: item._id });

    if (exists.length == 0) return false;

    if (Array.from(exists.editedBy)?.includes(item.editedBy))
      item.editedBy = [...Array.from(exists.editedBy), item.editedBy];
    else item.editedBy = [item.editedBy];

    await client
      .db()
      .collection('items')
      .updateOne({ _id: item._id }, { $set: { checkOut: new Date() } });
    return true;
  },
  async getUnusedBarcode(): Promise<string> {
    await client.connect();

    let exists = true;
    let barcode;

    while (exists) {
      barcode = generator();
      exists = (await client.db().collection('items').findOne({ _id: barcode }))
        ? true
        : false;
    }

    return barcode;
  },
};

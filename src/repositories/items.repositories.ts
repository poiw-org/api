import client from '../providers/mongo.providers';
import Item from '../entities/item';

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

  async searchItems(query: string): Promise<object[]> {
    await client.connect();

    return await client
      .db()
      .collection('items')
      .find({
        $or: [
          { _id: new RegExp(query, 'i') },
          { title: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') },
          { tags: new RegExp(query, 'i') },
        ],
      })
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

  async createItem(item: any): Promise<boolean> {
    await client.connect();

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

  async updateItem(item: any): Promise<boolean> {
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
};

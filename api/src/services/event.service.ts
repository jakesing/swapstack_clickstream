import IEventDBRow from "../interfaces/IEventDBRow";

export const logEvents = async (rows: IEventDBRow[]): Promise<boolean> => {
  try {
    return true;
  } catch (error) {
    throw error;
  }
};

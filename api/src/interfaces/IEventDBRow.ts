import IClickStreamEventParent from "./IClickStreamEventParent";
import IClickStreamEventChild from "./IClickStreamEventChild";

export default interface IEventDBRow {
  parent: IClickStreamEventParent;
  child: IClickStreamEventChild;
}

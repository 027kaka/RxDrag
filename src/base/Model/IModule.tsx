import { IPage } from 'base/Model/IPage';
import { IAuth } from 'base/Model/IAuth';


export interface IModule {
  id: number;
  slug: string;
  name: string;
  pages?: IPage[];
  indexPageId?: number;
  auths?: IAuth[];
}

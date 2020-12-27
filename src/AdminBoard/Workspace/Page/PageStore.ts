import { IMeta } from "base/Model/IMeta";
import { IPage } from "base/Model/IPage";
import { IValidateRule } from "base/Model/IValidateRule";
import { hasSubFields } from "base/RxDrag";
import { RXNodeRoot } from "base/RXNode/Root";
import { RXNode } from "base/RXNode/RXNode";
import { makeAutoObservable } from "mobx";
import { cloneObject } from "utils/cloneObject";

export class FieldStore{
  fieldName?: string;
  defaultValue?: any;
  value?: any;
  error?: string;
  rule?: IValidateRule;
  subFields?: Map<string,FieldStore>;
  loading?: boolean;
  constructor(meta:IMeta) {
    makeAutoObservable(this);    
    this.fieldName = meta.props?.field;
    if(hasSubFields(meta.name)){
      this.subFields = new Map<string,FieldStore>();
    }
  }

  toFieldsGQL(){
    let subGql = ''
    this.subFields?.forEach(fieldStore=>{
      subGql = subGql + ` ${fieldStore.toFieldsGQL()} `
    })
    return subGql ? ` ${this.fieldName} { id ${subGql} } ` : ` ${this.fieldName} `;
  }

  setModel(model:any){
    const fieldValue = model && this.fieldName ? model[this.fieldName] : undefined; 
    if(!this.subFields){
      this.defaultValue = fieldValue  
    }
    else{
      this.subFields?.forEach(fieldStore=>{
        fieldStore.setModel(fieldValue)
      })
    }

  }
}

function parseFieldFromNode(fields:Map<string,FieldStore>, node: RXNode<IMeta>){
  const fieldName = node.meta.props?.field;
  let subFields = fields;
  if(fieldName){
    let fieldStore = new FieldStore(node.meta);
    if(fieldStore.subFields){
      subFields = fieldStore.subFields;
    }
    fields.set(fieldName, fieldStore);
  }
  
  node.children?.forEach(child=>{
    parseFieldFromNode(subFields ,child);
  })
}

export class PageStore{
  loading?: boolean;
  fields: Map<string,FieldStore>;
  pageLayout?:Array<RXNode<IMeta>>;
  constructor() {
    makeAutoObservable(this)
    this.fields = new Map<string,FieldStore>();
  }

  setLoading(loading?:boolean){
    this.loading = loading;
  }

  parsePage(page?:IPage){
    const layout = page?.schema?.layout || [];
    let root = new RXNodeRoot<IMeta>();
    root.parse(cloneObject(layout));
    this.pageLayout = root.children;

    this.pageLayout?.forEach(node=>{
      parseFieldFromNode(this.fields, node);
    })
  }

  setModel(model:any){
    console.log('setModel', model)
    this.fields.forEach(fieldStore=>{
      fieldStore.setModel(model);
    })
  }

  toFieldsGQL(){
    let gql = ''
    this.fields.forEach(fieldStore=>{
      gql = gql + ` ${fieldStore.toFieldsGQL()} `
    })
    return gql;
  }
}
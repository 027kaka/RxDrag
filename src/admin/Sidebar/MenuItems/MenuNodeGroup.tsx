import { makeStyles, Theme, createStyles, Divider, Collapse, List } from "@material-ui/core";
import IMenuItem, { IMenuBadge } from "base/Model/IMenuItem"
import { RXNode } from "base/RXNode/RXNode"
import classNames from "classnames"
import React, { Fragment } from "react"
import Subheader from "./Subheader";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuNode from "./MenuNode";
import { fade } from '@material-ui/core/styles/colorManipulator';
import useLoggedUser from "store/app/useLoggedUser";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(4),
    },
    itemOpened:{
      background: fade(theme.palette.primary.main, 0.1),
      "&:hover,&:focus": {
        backgroundColor: fade(theme.palette.primary.main, 0.3),
      }
    },
    indicator:{
      transition:"all 0.3s",
    },
    opened:{
      transform:'rotate(90deg)',
    },
  }),
);
export function getBadge(children:Array<RXNode<IMenuItem>>): IMenuBadge|undefined{
  for(let node of children){
    if(node.meta.badge){
      return node.meta.badge
    }
    if(node.children){
      let badge = getBadge(node.children)
      if(badge){
        return badge
      }
    }
  }
  return undefined
}

export default function MenuNodeGroup(
  props:{
    node:RXNode<IMenuItem>,
    openedId?: number,
    onOpened: (id:number)=>void,
    mini:boolean,
    nested?:boolean,
  }
)
{
  const open = props.openedId === props.node.id
  const [openedId, setOpenedId] = React.useState(-1);
  const loggedUser = useLoggedUser();

  const handleOpened = (id:number)=>{
    setOpenedId(id)
  }

  const handleClick = () => {
    open ? props.onOpened(-1) : props.onOpened(props.node.id)
  };
  const classes = useStyles();
  const dotBadge = getBadge(props.node.children)
  const listItems = props.node.children?.map((node:RXNode<IMenuItem>)=>{
    let item = node.meta;
    const authed = loggedUser.authCheck(...node.meta?.auths||[]);
    return (
    <Fragment key={node.id}>
      {
        item.type === 'subheader' && authed && <Subheader nested mini = {props.mini} node={node} />
      }
      {item.type === 'item' && authed && <MenuNode nested mini = {props.mini} node={node}/> }
      {item.type === 'group' && authed && <MenuNodeGroup nested mini = {props.mini} node={node} onOpened={handleOpened} openedId={openedId}/>}
      {item.type === 'divider' && authed && <Divider />}
    </Fragment>
    )
  })
  return (
    <Fragment>
      <MenuNode className={open ? classes.itemOpened :''} 
        mini= {props.mini} 
        node={props.node} 
        dotBadge={!open && dotBadge} 
        onClick={handleClick}
      >
        <ChevronRightIcon className={
            classNames(classes.indicator, {[classes.opened] : open}) 
          } 
        />
      </MenuNode>
      <Collapse in={props.openedId === props.node.id} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={props.mini ? '' : classes.nested}>
          {listItems}
        </List>
      </Collapse>
    </Fragment>
  )  
}

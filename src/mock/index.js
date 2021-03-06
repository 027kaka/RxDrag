import Mock from 'mockjs'
import drawer from './drawer'
import dashboard from './views/dashboard'
import auths from './data/auths'
import appInfo from './data/appInfo'
import notifications from './data/notifications'
import mockMedias from './medias/mock'
import mockModules from './modules/mock'
import mockModel from './model/mock'
import mockTrees from './tree/mock'
import getQueryVariable from './utils/getQueryVariable'

window.drawerData = drawer;

function getUser(account){
  let users = window.listModels['/Model/User']
  if(!users){
    return undefined
  }

  for(var i = 0; i < users.length; i++){
    let user = users[i];
    if(user.login_name === account){
      return user;
    }
  }
}

function login(account, password){
  let users = window.listModels['/Model/User']
  if(!users){
    return undefined
  }

  for(var i = 0; i < users.length; i++){
    let user = users[i];
    if(user.login_name === account && user.password === password){
      return user;
    }
  }
}

function addAuthsToUser(user){
  if(!user){
    return user;
  }
  let roles = window.listModels['/Model/Role'] 
  user.auths = [];
  if(!user.roleIds){
    return user;
  }

  user.roleIds&&user.roleIds.forEach((roleId)=>{
    roles.forEach((role)=>{
      if(roleId === role.id){
        user.auths = [ ...user.auths, ...(role.auths||[])];
      }
    })
  })

  return user
}

Mock.mock('/api/drawer', 'get', (request)=>{
  return window.drawerData;
})

Mock.mock('/api/save-drawer','post', (request)=>{
  window.drawerData = JSON.parse(request.body); 
  return true;
})

Mock.mock('/api/page/dashboard', 'get', dashboard)

mockMedias();
mockModules();
mockModel();
mockTrees();

Mock.mock('/api/get-auths','get', (request)=>{
  return auths
})

Mock.mock('/api/login', 'post',  (request)=>{
  let data = JSON.parse(request.body)
  let user = login(data.account,  data.password)
  if(user){
    return{
      success:true,
      appInfo:{...appInfo, authToken:user.login_name, user:addAuthsToUser(user)},
    }   
  }
  else{
    return{
      status:false,
      errorMessage:'用户名或密码错误',
    }
  }
})

Mock.mock(RegExp('/api/get-app-info?.*'),'get', (request)=>{
  let token = getQueryVariable('token', request.url);
  let user = getUser(token);
  return {...appInfo, authToken:user?.login_name, user:addAuthsToUser(user)}
})

Mock.mock('/api/get-lasted-notifications', notifications);

Mock.setup({
    timeout: 500
})
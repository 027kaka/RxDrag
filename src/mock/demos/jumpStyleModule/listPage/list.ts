export default {
  name:'ListView',
  designProps:{
    //isDesigning:true,
    //query:null,
  },
  props:{
    variant:'outlined',
    //elevation:6,
       
  },
  children:[
    {
      name:'ListViewToolbar',
      children:[
        {
          name:'ListViewFilters',
          children:[
            {
              name:'ListViewKeywordFilter',
              props:{
                size:'small',
              }
            },
            {
              name:'ListViewEnumFilter',
              props:{
                marginLeft:2,
              }
            }
          ]
        },
        {
          name:'ListViewBatchCommads',
        }
      ]
    },
    {
      name:'ListViewBody',
    }
  ],      
}

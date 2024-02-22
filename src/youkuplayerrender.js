const player = {
    props:['url'],
    template:`<iframe :src="url" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`

}
const App = Vue.createApp({
    setup(){
        const url = Vue.ref('')
        Vue.onMounted(async () => {  
            try {  
              url.value = await window.electronAPI.getParseUrl(); 
            } catch (error) {  
              console.error('Error fetching URL:', error);  
            }  
          });  
        
          // 监听 iframeSrc 的变化，并在变化时更新 iframe 的 src  
        Vue.watch(url, (newVal) => {  
        if (newVal) {  
            console.log(`url更新，当前url为:${url.value}`)
        }  
        }); 
        return{
            url
        }

    }

})
App.component('player',player)
App.mount("#app")
// // 监听窗口大小变化并调整iframe大小  
// window.addEventListener('resize', function() {  
//   const iframe = document.querySelector('iframe');  
//   iframe.style.height = window.innerHeight + 'px';  
// }); 


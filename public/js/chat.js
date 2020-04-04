const socket = io()


//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () =>{
    const $newMessage = $messages.lastElementChild
    
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }






}

socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:m a ')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:m a ') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()    
    
    $messageFormButton.setAttribute('disabled','disabled ')


    const message = e.target.elements.message.value;
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delievered')
    })
})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geo  Loc ation is not supported by your Browser.')
    }

    $sendLocationButton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})

socket.emit('join',{ username, room}, (error)=>{
     if(error){
         alert(error)
         location.href = '/'
     }
})
socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
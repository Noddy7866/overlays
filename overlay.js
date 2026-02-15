// Overlay script for OBS - fetches and displays recent super chats

function getSuperChats(){
const history=JSON.parse(localStorage.getItem("superchat")||"[]");
return history;
}

function getTodayTotal(){
const history=getSuperChats();
const today=new Date().toDateString();
let total=0;
history.forEach(item=>{
const itemDate=new Date(item.time).toDateString();
if(itemDate===today){
total+=item.amount;
}
});
return total;
}

function formatTime(dateString){
const date=new Date(dateString);
const now=new Date();
const diffMs=now-date;
const diffMins=Math.floor(diffMs/60000);
const diffHours=Math.floor(diffMins/60);

if(diffMins<1)return"Just now";
if(diffMins<60)return`${diffMins}m ago`;
if(diffHours<24)return`${diffHours}h ago`;
return date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
}

function renderOverlay(){
const history=getSuperChats();
const listContainer=document.getElementById("overlayList");

// Get previous item IDs to detect new ones
const previousItems=listContainer.querySelectorAll(".overlay-item");
const previousIds=new Set();
previousItems.forEach(item=>{
previousIds.add(item.dataset.id);
});

// Clear and rebuild
listContainer.innerHTML="";

history.slice(0,10).forEach((item,index)=>{
const isNew=!previousIds.has(item.time+item.amount+item.name);
const div=document.createElement("div");
div.className="overlay-item"+(isNew?" new":"");
div.dataset.id=item.time+item.amount+item.name;

div.innerHTML=`
<div class="item-amount">₹${item.amount}</div>
<div class="item-details">
<div class="item-name">${item.name}</div>
${item.message?`<div class="item-message">"${item.message}"</div>`:""}
<div class="item-time">${formatTime(item.time)}</div>
</div>
`;

listContainer.appendChild(div);
});

// Update total
const todayTotal=getTodayTotal();
document.getElementById("totalRaised").textContent=`₹${todayTotal} raised today`;
}

// Listen for storage changes from other tabs (main app)
window.addEventListener("storage",(e)=>{
if(e.key==="superchat"){
renderOverlay();
}
});

// Initial render
renderOverlay();

// Auto-refresh every 3 seconds
setInterval(renderOverlay,3000);

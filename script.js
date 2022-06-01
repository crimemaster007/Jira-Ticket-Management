let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textAreaCont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");


let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addflag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketArr = [];


if (localStorage.getItem("jira_tickets")) {
    //retrieve and display tickets
    ticketArr = JSON.parse(localStorage.getItem("jira_ticket"));
    ticketArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}



for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBocColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketArr.filter((ticketObj, idx) => {
            return currentToolBocColor === ticketObj.ticketColor;
        })

        //remove previous tickets

        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }

        //display new filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        //remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }

        ticketArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })

    })
}





// Listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");

        modalPriorityColor = colorElem.classList[0];
    })
})

addBtn.addEventListener("click", (e) => {
    //Display modal
    //Generate ticket

    //AddFlag, true --> Modal Display
    //AddFlag, false --> Modal None
    addflag = !addflag;
    if (addflag) {
        modalCont.style.display = "flex";
    }
    else {
        modalCont.style.display = "none";

    }

})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})


modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === "Shift") {
        createTicket(modalPriorityColor, textAreaCont.value);
        setModalToDefault();
        addflag = false;
    }
})


function createTicket(ticketColor, ticketTask, ticketID) {
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
          <i class="fas fa-lock"></i>
        </div>
    `;
    mainCont.appendChild(ticketCont);

    // create object of ticket and add to array
    if (!ticketID) {
        ticketArr.push({ ticketColor, ticketTask, ticketID: id });
        localStorage.setItem("jira_ticket", JSON.stringify(ticketArr));

    }


    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);

}


function handleRemoval(ticket, id) {
    //removeFlag -> true -> remove
    ticket.addEventListener("click", (e) => {
        if (removeFlag) {

            let idx = getTicketIdx(id);

            //DB removal
            ticketArr.splice(idx, 1);
            let strTicketArr = JSON.stringify(ticketArr);
            localStorage.setItem("jira_ticket", strTicketArr);

            //UI removal
            ticket.remove();
        }

        else {
            return;

        }

    })
}

function handleLock(ticket, id) {
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);
        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");

        }

        //modify data in local storage
        ticketArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));

    })
}

function handleColor(ticket, id) {
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        // get ticketIdx from the ticket array
        let ticketIdx = getTicketIdx(id);

        let currentTicketColor = ticketColor.classList[1];

        //get ticket color idx

        let currentTicketColorIdx = colors.findIndex((color) => {
            return color === currentTicketColor;
        });

        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // modify data in local storage (priority color change)
        ticketArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_ticket", JSON.stringify(ticketArr));
    })
}


function getTicketIdx(id) {
    let ticketIdx = ticketArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    });
    return ticketIdx;
}

function setModalToDefault() {
    modalCont.style.display = "none";
    textAreaCont.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
}
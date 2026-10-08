// ==========================================
// STATE
// ==========================================

let tasks =
    JSON.parse(
        localStorage.getItem("myTasks")
    ) || [];

let currentFilter = "all";
let currentSearch = "";
let currentSort = "newest";
let editingTaskId = null;


// ==========================================
// DOM ELEMENTS
// ==========================================

const taskInput =
    document.getElementById("taskInput");

const addBtn =
    document.getElementById("addBtn");

const priorityInput =
    document.getElementById("priorityInput");

const categoryInput =
    document.getElementById("categoryInput");

const dateInput =
    document.getElementById("dateInput");

const searchInput =
    document.getElementById("searchInput");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const filters =
    document.querySelector(".filters");

const sortSelect =
    document.getElementById("sortSelect");

const totalCount =
    document.getElementById("totalCount");

const activeCount =
    document.getElementById("activeCount");

const completedCount =
    document.getElementById("completedCount");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const remainingText =
    document.getElementById("remainingText");

const clearCompleted =
    document.getElementById("clearCompleted");

const themeBtn =
    document.getElementById("themeBtn");


// Modal elements

const editModal =
    document.getElementById("editModal");

const editTaskInput =
    document.getElementById("editTaskInput");

const editPriority =
    document.getElementById("editPriority");

const editCategory =
    document.getElementById("editCategory");

const editDate =
    document.getElementById("editDate");

const saveEdit =
    document.getElementById("saveEdit");

const closeModal =
    document.getElementById("closeModal");


// ==========================================
// SAVE DATA
// ==========================================

function saveTasks() {

    localStorage.setItem(
        "myTasks",
        JSON.stringify(tasks)
    );

}


// ==========================================
// ADD TASK
// ==========================================

function addTask() {

    const text =
        taskInput.value.trim();


    if (text === "") {

        alert("Please enter a task.");

        return;

    }


    const task = {

        id: Date.now(),

        text: text,

        completed: false,

        priority:
            priorityInput.value,

        category:
            categoryInput.value,

        dueDate:
            dateInput.value,

        createdAt:
            Date.now()

    };


    tasks.push(task);

    saveTasks();

    taskInput.value = "";

    dateInput.value = "";

    displayTasks();

}


// ==========================================
// ADD BUTTON
// ==========================================

addBtn.addEventListener(
    "click",
    addTask
);


// ==========================================
// ENTER KEY
// ==========================================

taskInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


// ==========================================
// GET FILTERED TASKS
// ==========================================

function getFilteredTasks() {

    let result = [...tasks];


    // Filter

    if (currentFilter === "active") {

        result =
            result.filter(
                task => !task.completed
            );

    }


    else if (
        currentFilter === "completed"
    ) {

        result =
            result.filter(
                task => task.completed
            );

    }


    // Search

    if (currentSearch !== "") {

        const search =
            currentSearch.toLowerCase();


        result =
            result.filter(task =>

                task.text
                    .toLowerCase()
                    .includes(search)

                ||

                task.category
                    .toLowerCase()
                    .includes(search)

                ||

                task.priority
                    .toLowerCase()
                    .includes(search)

            );

    }


    // Sorting

    if (currentSort === "newest") {

        result.sort(
            (a, b) =>
                b.createdAt - a.createdAt
        );

    }


    else if (currentSort === "oldest") {

        result.sort(
            (a, b) =>
                a.createdAt - b.createdAt
        );

    }


    else if (currentSort === "priority") {

        const order = {

            high: 1,

            medium: 2,

            low: 3

        };


        result.sort(
            (a, b) =>
                order[a.priority] -
                order[b.priority]
        );

    }


    else if (currentSort === "date") {

        result.sort(function(a, b) {

            if (!a.dueDate)
                return 1;

            if (!b.dueDate)
                return -1;

            return a.dueDate
                .localeCompare(b.dueDate);

        });

    }


    return result;

}


// ==========================================
// DISPLAY TASKS
// ==========================================

function displayTasks() {

    taskList.innerHTML = "";


    const filteredTasks =
        getFilteredTasks();


    emptyState.style.display =
        filteredTasks.length === 0
            ? "block"
            : "none";


    filteredTasks.forEach(
        function(task) {

            const li =
                document.createElement("li");


            li.className = "task";


            if (task.completed) {

                li.classList.add(
                    "completed"
                );

            }


            const dateText =
                task.dueDate
                    ? formatDate(
                        task.dueDate
                    )
                    : "No due date";


            li.innerHTML = `

                <button
                    class="check-btn"
                    data-action="toggle"
                    data-id="${task.id}">
                    ${task.completed ? "✓" : ""}
                </button>

                <div class="task-info">

                    <div class="task-title">

                        ${escapeHTML(
                            task.text
                        )}

                    </div>

                    <div class="task-meta">

                        <span class="badge">

                            ${escapeHTML(
                                task.category
                            )}

                        </span>

                        <span class="
                            badge
                            priority-${task.priority}
                        ">

                            ${capitalize(
                                task.priority
                            )}

                        </span>

                        <span class="badge">

                            ${dateText}

                        </span>

                    </div>

                </div>

                <div class="task-actions">

                    <button
                        data-action="edit"
                        data-id="${task.id}">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        data-action="delete"
                        data-id="${task.id}">
                        Delete
                    </button>

                </div>

            `;


            taskList.appendChild(li);

        }
    );


    updateStatistics();

}


// ==========================================
// EVENT DELEGATION
// ==========================================

taskList.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest("button");


        if (!button)
            return;


        const action =
            button.dataset.action;


        const id =
            Number(button.dataset.id);


        // Complete / Undo

        if (action === "toggle") {

            const task =
                tasks.find(
                    task =>
                        task.id === id
                );


            if (task) {

                task.completed =
                    !task.completed;

            }

        }


        // Edit

        else if (action === "edit") {

            openEditModal(id);

            return;

        }


        // Delete

        else if (action === "delete") {

            const confirmed =
                confirm(
                    "Delete this task?"
                );


            if (!confirmed)
                return;


            tasks =
                tasks.filter(
                    task =>
                        task.id !== id
                );

        }


        saveTasks();

        displayTasks();

    }
);


// ==========================================
// EDIT MODAL
// ==========================================

function openEditModal(id) {

    const task =
        tasks.find(
            task =>
                task.id === id
        );


    if (!task)
        return;


    editingTaskId = id;


    editTaskInput.value =
        task.text;


    editPriority.value =
        task.priority;


    editCategory.value =
        task.category;


    editDate.value =
        task.dueDate;


    editModal.classList.add(
        "show"
    );

}


// ==========================================
// SAVE EDIT
// ==========================================

saveEdit.addEventListener(
    "click",
    function() {

        const task =
            tasks.find(
                task =>
                    task.id ===
                    editingTaskId
            );


        if (!task)
            return;


        const text =
            editTaskInput.value.trim();


        if (text === "") {

            alert(
                "Task name cannot be empty."
            );

            return;

        }


        task.text = text;

        task.priority =
            editPriority.value;

        task.category =
            editCategory.value;

        task.dueDate =
            editDate.value;


        saveTasks();

        closeEditModal();

        displayTasks();

    }
);


// ==========================================
// CLOSE MODAL
// ==========================================

closeModal.addEventListener(
    "click",
    closeEditModal
);


editModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            editModal
        ) {

            closeEditModal();

        }

    }
);


function closeEditModal() {

    editModal.classList.remove(
        "show"
    );

    editingTaskId = null;

}


// ==========================================
// FILTER
// ==========================================

filters.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                ".filter-btn"
            );


        if (!button)
            return;


        currentFilter =
            button.dataset.filter;


        document
            .querySelectorAll(
                ".filter-btn"
            )
            .forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


        button.classList.add(
            "active"
        );


        displayTasks();

    }
);


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    function(event) {

        currentSearch =
            event.target.value.trim();


        displayTasks();

    }
);


// ==========================================
// SORT
// ==========================================

sortSelect.addEventListener(
    "change",
    function(event) {

        currentSort =
            event.target.value;


        displayTasks();

    }
);


// ==========================================
// CLEAR COMPLETED
// ==========================================

clearCompleted.addEventListener(
    "click",
    function() {

        const completed =
            tasks.filter(
                task =>
                    task.completed
            );


        if (completed.length === 0) {

            alert(
                "There are no completed tasks."
            );

            return;

        }


        const confirmed =
            confirm(
                "Clear all completed tasks?"
            );


        if (!confirmed)
            return;


        tasks =
            tasks.filter(
                task =>
                    !task.completed
            );


        saveTasks();

        displayTasks();

    }
);


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const active =
        total - completed;


    totalCount.textContent =
        total;


    activeCount.textContent =
        active;


    completedCount.textContent =
        completed;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) *
                100
            );

    }


    progressFill.style.width =
        progress + "%";


    progressText.textContent =
        progress + "%";


    remainingText.textContent =

        active === 1

            ? "1 remaining"

            : active +
              " remaining";

}


// ==========================================
// THEME
// ==========================================

themeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        themeBtn.textContent =
            dark ? "☀" : "☾";


        localStorage.setItem(
            "theme",
            dark
                ? "dark"
                : "light"
        );

    }
);


// ==========================================
// LOAD THEME
// ==========================================

if (
    localStorage.getItem("theme")
    === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    themeBtn.textContent = "☀";

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


// ==========================================
// CAPITALIZE
// ==========================================

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent = text;


    return div.innerHTML;

}


// ==========================================
// INITIAL LOAD
// ==========================================

displayTasks();
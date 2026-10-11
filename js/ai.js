const API_URL =
    "http://localhost:5000/api/ai/ask";

const RECOMMENDATION_API =
    "http://localhost:5000/api/ai/recommendations";


const token =
    localStorage.getItem(
        "studyRoomToken"
    );


if (!token) {

    window.location.href =
        "login.html";

}


const aiForm =
    document.getElementById(
        "aiForm"
    );


const messageInput =
    document.getElementById(
        "aiMessage"
    );


const subjectInput =
    document.getElementById(
        "aiSubject"
    );


const topicInput =
    document.getElementById(
        "aiTopic"
    );


const modeInput =
    document.getElementById(
        "aiMode"
    );


const chatMessages =
    document.getElementById(
        "chatMessages"
    );


const sendBtn =
    document.getElementById(
        "sendBtn"
    );


// =====================================
// SEND QUESTION
// =====================================

aiForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const message =
            messageInput
                .value
                .trim();


        if (!message)
            return;


        addMessage(
            "user",
            message
        );


        messageInput.value =
            "";


        sendBtn.disabled =
            true;


        const loading =
            addLoadingMessage();


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                message,

                                subject:
                                    subjectInput
                                        .value
                                        .trim(),

                                topic:
                                    topicInput
                                        .value
                                        .trim(),

                                mode:
                                    modeInput
                                        .value

                            })

                    }
                );


            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "studyRoomToken"
                );

                localStorage.removeItem(
                    "studyRoomUser"
                );


                window.location.href =
                    "login.html";

                return;
            }


            const data =
                await response.json();


            loading.remove();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "AI request failed"
                );

            }


            addMessage(
                "ai",
                data.answer
            );

        } catch (error) {

            loading.remove();


            addMessage(
                "ai",
                "Sorry, I could not generate an answer. " +
                error.message
            );

        } finally {

            sendBtn.disabled =
                false;


            messageInput.focus();

        }

    }
);


// =====================================
// MESSAGE UI
// =====================================

function addMessage(
    type,
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.className =
        type === "user"

            ? "message user-message"

            : "message ai-message";


    const paragraph =
        document.createElement(
            "p"
        );


    paragraph.textContent =
        text;


    div.appendChild(
        paragraph
    );


    chatMessages.appendChild(
        div
    );


    scrollToBottom();


    return div;
}


function addLoadingMessage() {

    const div =
        document.createElement(
            "div"
        );


    div.className =
        "message ai-message loading-message";


    div.textContent =
        "StudyRoom AI is thinking...";


    chatMessages.appendChild(
        div
    );


    scrollToBottom();


    return div;
}


function scrollToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// =====================================
// QUICK PROMPTS
// =====================================

document
    .querySelectorAll(
        "[data-prompt]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    messageInput.value =
                        button.dataset.prompt;


                    messageInput.focus();

                }
            );

        }
    );


// =====================================
// PERSONALIZED RECOMMENDATIONS
// =====================================

async function loadRecommendations() {

    const container =
        document.getElementById(
            "aiRecommendations"
        );


    if (!container)
        return;


    container.innerHTML = `
        <p>
            Loading recommendations...
        </p>
    `;


    try {

        const response =
            await fetch(
                RECOMMENDATION_API,
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "studyRoomToken"
            );

            localStorage.removeItem(
                "studyRoomUser"
            );


            window.location.href =
                "login.html";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not load recommendations"
            );

        }


        container.innerHTML =
            "";


        const recommendations =
            data.recommendations || [];


        if (
            recommendations.length === 0
        ) {

            container.innerHTML = `

                <p>
                    Take some quizzes first
                    so I can personalize
                    your study recommendations.
                </p>

            `;

            return;
        }


        recommendations.forEach(
            item => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "recommendation-card";


                const timerURL =

                    "timer.html?subject="

                    +

                    encodeURIComponent(
                        `${item.subject} - ${item.topic}`
                    )

                    +

                    "&minutes="

                    +

                    item.minutes;


                card.innerHTML = `

                    <strong>

                        ${escapeHTML(
                            item.title
                        )}

                    </strong>


                    <p>

                        ${escapeHTML(
                            item.description
                        )}

                    </p>


                    <a
                        href="${timerURL}"
                    >
                        Study ${item.minutes} min
                    </a>

                `;


                container.appendChild(
                    card
                );

            }
        );

    } catch (error) {

        console.error(
            "Recommendation Error:",
            error
        );


        container.innerHTML = `

            <p>
                Recommendations unavailable.
            </p>

        `;

    }

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            text ?? ""
        );


    return div.innerHTML;

}


// =====================================
// START
// =====================================

loadRecommendations();
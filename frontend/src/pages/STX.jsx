import { createSignal, createEffect, For } from "solid-js";
import { useNavigate } from "@solidjs/router";

const STX = () => {
    const navigate = useNavigate();
    const [radius, setRadius] = createSignal(0);
    const [table, setTable] = createSignal([]);
    const [inputs, setInputs] = createSignal({});

    let radiusRef;
    let formRef;
    let ctrltableRef;
    let fdbtableRef;

    const handleSubmit = async () => {
        const ctrlInputs = Array.from(
            ctrltableRef.querySelectorAll("input.ctrlIN"),
        );
        const fdbInputs = Array.from(
            fdbtableRef.querySelectorAll("input.fdbIN"),
        );
        const ctrlVals = ctrlInputs.map((input) =>
            input.value === "" ? "0" : input.value,
        );
        const fdbVals = fdbInputs.map((input) =>
            input.value === "" ? "0" : input.value,
        );

        const dataToSend = {
            radius: radiusRef.value,
            ctrl: ctrlVals,
            fdb: fdbVals,
        };
        try {
            const response = await fetch("/temp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data) {
                console.log(data);
                navigate("/", { replace: true });
            } else {
                console.error("No connection");
            }
        }
        catch (error) {
            console.error("Error sending data:", error);
        }
    };

    const updateRadius = (newRadius) => {
        setRadius(parseInt(newRadius) || 0);
    };

    createEffect(() => {
        const r = radius();
        const size = 2 * r + 1;
        const newTable = Array(size)
            .fill()
            .map((_, i) =>
                Array(size)
                    .fill()
                    .map((_, j) => {
                        const x = j - r;
                        const y = i - r;
                        return {
                            value: "",
                            inRadius: Math.abs(x) + Math.abs(y) <= r,
                        };
                    }),
            );
        setTable(newTable);
    });

    return (
        <div>
            <div>
                <label>
                    Radius:
                    <input
                        ref={radiusRef}
                        type="number"
                        min="0"
                        max="3"
                        id="radiusIN"
                        value={radius()}
                        onInput={(e) => updateRadius(e.target.value)}
                    />
                </label>
            </div>
            <form id="submitTemplates" ref={formRef}>
                <h3>Control Template</h3>
                <table ref={ctrltableRef}>
                    <tbody>
                        <For each={table()}>
                            {(row, i) => (
                                <tr>
                                    <For each={row}>
                                        {(cell, j) => (
                                            <td>
                                                <input
                                                    value={cell.value}
                                                    placeholder="0"
                                                    step="0.1"
                                                    type="number"
                                                    class="ctrlIN"
                                                    style={{
                                                        "background-color":
                                                            cell.inRadius
                                                                ? "lightblue"
                                                                : "white",
                                                    }}
                                                    onInput={(e) => {
                                                        const newTable = [
                                                            ...table(),
                                                        ];
                                                        newTable[i()][
                                                            j()
                                                        ].value =
                                                            e.target.value;
                                                        setTable(newTable);
                                                    }}
                                                />
                                            </td>
                                        )}
                                    </For>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
                <h3>Feedback template</h3>
                <table ref={fdbtableRef}>
                    <tbody>
                        <For each={table()}>
                            {(row, i) => (
                                <tr>
                                    <For each={row}>
                                        {(cell, j) => (
                                            <td>
                                                <input
                                                    value={cell.value}
                                                    placeholder="0"
                                                    class="fdbIN"
                                                    step="0.1"
                                                    type="number"
                                                    style={{
                                                        "background-color":
                                                            cell.inRadius
                                                                ? "lightblue"
                                                                : "white",
                                                    }}
                                                    onInput={(e) => {
                                                        const newTable = [
                                                            ...table(),
                                                        ];
                                                        newTable[i()][
                                                            j()
                                                        ].value =
                                                            e.target.value;
                                                        setTable(newTable);
                                                    }}
                                                />
                                            </td>
                                        )}
                                    </For>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
                <button type="button" id="sendSubmit" onClick={handleSubmit}>
                    Send to server
                </button>
            </form>
            <a href="/">Back</a>
        </div>
    );
};

export default STX;

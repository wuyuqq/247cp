/**
 * Loon 自动策略
 * Wi-Fi: guanxi
 * 进入 guanxi → 所有策略组切换 DIRECT
 * 离开 guanxi → 恢复原策略
 */

const TARGET_SSID = "GuanXi_5G";
const DIRECT_POLICY = "DIRECT";

// 获取配置
const conf = JSON.parse($config.getConfig());

// 当前 Wi-Fi
const ssid = conf.ssid || "";

// 所有策略组
const groups = conf.all_policy_groups || [];

// 当前模式
const previousMode =
    $persistentStore.read("auto_policy_mode") || "RULE";

// 判断目标模式
const targetMode =
    ssid === TARGET_SSID ? "DIRECT" : "RULE";

console.log(`SSID: ${ssid}`);
console.log(`${previousMode} -> ${targetMode}`);

if (previousMode === "RULE" && targetMode === "DIRECT") {

    // 保存当前策略
    saveDecisions();

    // 全部切 DIRECT
    for (const group of groups) {
        setPolicy(group, DIRECT_POLICY);
    }

    $notification.post(
        "Loon 自动策略",
        ssid,
        "已切换为 DIRECT"
    );
}

// 恢复
if (previousMode === "DIRECT" && targetMode === "RULE") {

    restoreDecisions();

    $notification.post(
        "Loon 自动策略",
        ssid || "非 guanxi",
        "已恢复原策略"
    );
}

// 保存模式
$persistentStore.write(
    targetMode,
    "auto_policy_mode"
);

$done();


// 保存当前策略组选择
function saveDecisions() {

    const decisions = conf.policy_select || {};

    $persistentStore.write(
        JSON.stringify(decisions),
        "auto_policy_decisions"
    );
}


// 恢复策略
function restoreDecisions() {

    const data =
        $persistentStore.read("auto_policy_decisions");

    if (!data) return;

    const decisions = JSON.parse(data);

    for (const group of groups) {

        if (decisions[group]) {

            setPolicy(
                group,
                decisions[group]
            );
        }
    }
}


// 设置策略
function setPolicy(group, policy) {

    $config.setSelectPolicy(
        group,
        policy
    );

    console.log(
        `${group} -> ${policy}`
    );
}

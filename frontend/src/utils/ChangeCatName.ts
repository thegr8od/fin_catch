export const changeCatNameToKorean = (name: string): string => {
  const catNameMap: { [key: string]: string } = {
    classic: "기본 고양이",
    unique_rabbit: "토끼일고양",
    demonic: "못된 고양이",
    master: "표백 고양이",
    egypt: "클레오파트냥",
    batman: "냥트맨",
    christmas: "산타냥",
    simase: "샴 고양이",
    tiger: "호냥이",
    slave: "순둥 고양이",
  };

  return catNameMap[name] || name;
};

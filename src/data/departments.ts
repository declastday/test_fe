/**
 * 대학별 학과 데이터
 * - 유지보수를 위해 별도 파일로 분리
 * - college: 대학명
 * - departments: 해당 대학 소속 학과 목록
 */
export const DEPARTMENTS = [
    {
        college: "경상대학",
        departments: [
            "경영학과",
            "회계학과",
            "경제통상학과",
            "무역학과",
            "관광경영학과",
            "호텔외식경영학과",
        ],
    },
    {
        college: "인문사회대학",
        departments: [
            "법학과",
            "경찰행정학과",
            "신문방송학과",
            "사회복지학과",
            "지적학과",
            "광고홍보학과",
            "영어영문학과",
            "문헌정보학과",
        ],
    },
    {
        college: "공과대학",
        departments: [
            "신소재화학과",
            "건축학과",
            "건축공학과",
            "토목공학과",
            "조경학과",
            "환경공학과",
            "전자공학과",
            "시스템반도체공학과",
            "에너지융합공학과",
        ],
    },
    {
        college: "AI·SW융합대학",
        departments: [
            "데이터사이언스학과",
            "인공지능소프트웨어학과",
            "디지털보안학과",
            "전기제어공학과",
        ],
    },
    {
        college: "예술대학",
        departments: [
            "산업디자인학과",
            "시각디자인학과",
            "공예디자인학과",
            "아트앤패션디자인학과",
            "디지털미디어디자인학과",
            "만화애니메이션학과",
            "영화영상학과",
            "연극학과",
            "생활체육학과",
        ],
    },
    {
        college: "보건의료과학대학",
        departments: [
            "간호학과",
            "치위생학과",
            "방사선학과",
            "물리치료학과",
            "작업치료학과",
            "임상병리학과",
            "동물보건복지학과",
            "바이오의약학과",
            "제약공학과",
            "스포츠재활학과",
            "의료경영학과",
        ],
    },
    {
        college: "항공·국방대학",
        departments: [
            "항공운항학과",
            "항공기계공학과",
            "무인항공기학과",
            "항공서비스학과",
            "군사학과",
        ],
    },
    {
        college: "자유전공학부",
        departments: ["자유전공학부"],
    },
] as const;

// 전체 학과 목록 (플랫하게 펼친 버전)
export const ALL_DEPARTMENTS = DEPARTMENTS.flatMap((college) =>
    college.departments.map((dept) => ({
        value: dept,
        label: dept,
        college: college.college,
    }))
);

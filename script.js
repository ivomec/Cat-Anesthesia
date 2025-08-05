document.addEventListener('DOMContentLoaded', function () {
    // --- 전역 변수 및 상수 ---
    const concentrations_cat = {
        butorphanol: 10, midazolam: 5, propofol: 10, alfaxalone: 10, ketamine: 100, ketamine_diluted: 10, bupivacaine: 5, lidocaine: 20,
        meloxicam_inj: 2, atropine: 0.5, norepinephrine_raw: 1, epinephrine: 1, vasopressin: 20, meloxicam_oral: 0.5, dexmedetomidine: 0.5
    };
    const pillStrengths_cat = { gabapentin: 100, amoxicillin_capsule: 250, famotidine: 10 };
    let selectedCatTubeInfo = { size: null, cuff: false, notes: '' };

    // --- 초기화 및 이벤트 리스너 ---
    initializeAll();

    function initializeAll() {
        // 전역 리스너
        document.getElementById('globalPetName').addEventListener('input', updateAllTitles);
        document.getElementById('weight').addEventListener('input', calculateAll);
        document.getElementById('patient_status').addEventListener('change', calculateAll);
        
        // 이미지 저장 버튼 리스너
        document.getElementById('saveStomatitisBtn')?.addEventListener('click', () => saveContentAsImage('stomatitisContent', '만성구내염_안내문'));
        document.getElementById('saveAlveolarBtn')?.addEventListener('click', () => saveContentAsImage('alveolarExpansionContent', '치조골팽윤_안내문'));
        document.getElementById('saveLipTrapBtn')?.addEventListener('click', () => saveContentAsImage('lipEntrapmentContent', 'LipEntrapment_안내문'));
        document.getElementById('saveCycloBtn')?.addEventListener('click', () => saveContentAsImage('cyclosporineContent', '사이클로스포린_안내문'));
        document.getElementById('saveGabaBtn')?.addEventListener('click', () => saveContentAsImage('gabapentinContent', '가바펜틴_안내문'));
        document.getElementById('saveNorspanBtn')?.addEventListener('click', () => saveContentAsImage('norspanContent', '노스판패치_안내문'));

        // TNR 탭 리스너
        document.getElementById('totalWeight')?.addEventListener('input', calculateTnrDose);
        document.getElementById('protocol')?.addEventListener('change', calculateTnrDose);

        // 기타 탭별 리스너 (기존 기능 유지)
        // ... (ET Tube, Cyclo, Norspan 등의 기존 리스너들은 여기에 위치)

        // 초기 계산 실행
        calculateAll();
        calculateTnrDose();
        updateAllTitles();
    }

    // --- 탭 기능 ---
    window.openTab = function(evt, tabName) {
        let i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
            tabcontent[i].classList.remove('active');
        }
        tablinks = document.getElementsByClassName("tab-button");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        const activeTab = document.getElementById(tabName);
        if (activeTab) {
            activeTab.style.display = "block";
            activeTab.classList.add('active');
            evt.currentTarget.className += " active";
        }
    }

    // --- 전역 이름 연동 ---
    function updateAllTitles() {
        const name = document.getElementById('globalPetName').value.trim();
        const nameOrDefault = name || "[환자이름]";
        
        document.querySelectorAll('.patient-name-placeholder').forEach(el => {
            el.textContent = nameOrDefault;
        });

        // 기존 제목 업데이트 로직 유지
        // ...
    }

    // --- 이미지 저장 기능 ---
    function saveContentAsImage(contentId, fileNameSuffix) {
        const content = document.getElementById(contentId);
        if (!content) {
            console.error("Content ID not found for saving image:", contentId);
            return;
        }
        const petName = document.getElementById('globalPetName').value.trim() || '환자';
        const fileName = `${petName}_${fileNameSuffix}.png`;
        
        html2canvas(content, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    
    // --- 계산기 및 프로토콜 ---
    function calculateAll() {
        updateAllTitles(); // 이름 동기화
        const weightInput = document.getElementById('weight');
        const weight = parseFloat(weightInput.value);
        
        if (!weightInput.value || isNaN(weight) || weight <= 0) {
            // 값이 없을 때 초기화 로직
            return;
        }
        
        // 기존의 모든 계산 함수 호출
        populatePrepTab(weight);
        populateDischargeTab(weight);
        // ...
    }

    function populatePrepTab(weight) {
        // 기존 마취 준비 탭 계산 로직
    }

    function populateDischargeTab(weight) {
        // 기존 퇴원약 탭 계산 로직
    }

    // --- TNR 계산기 기능 ---
    function calculateTnrDose() {
        const totalWeightInput = document.getElementById('totalWeight');
        const protocolSelect = document.getElementById('protocol');
        const resultDiv = document.getElementById('tnrResult');

        if (!totalWeightInput || !protocolSelect || !resultDiv) return;

        const totalWeight = parseFloat(totalWeightInput.value);
        const protocol = protocolSelect.value;
        const cageWeight = 3.6; // 케이지 무게 (kg)

        if (isNaN(totalWeight) || totalWeight <= 0) {
            resultDiv.innerHTML = "무게를 입력하면 자동으로 계산됩니다.";
            resultDiv.style.color = '#333';
            resultDiv.style.borderColor = '#ccc';
            return;
        }
        
        if (totalWeight <= cageWeight) {
            resultDiv.innerHTML = "케이지 무게(3.6kg)보다 큰 값을 입력해주세요.";
            resultDiv.style.color = '#d93025';
            resultDiv.style.borderColor = '#d93025';
            return;
        }

        const catWeight = totalWeight - cageWeight;
        let doseRate = 0;
        let protocolName = '';

        switch (protocol) {
            case 'dkb':
                doseRate = 0.1;
                protocolName = 'DKB';
                break;
            case 'dkz':
                doseRate = 0.05;
                protocolName = 'DKZ';
                break;
        }

        const finalDose = catWeight * doseRate;

        resultDiv.innerHTML = `고양이 예상 체중: <strong>${catWeight.toFixed(2)} kg</strong><br>
                               선택 프로토콜 (${protocolName}) 권장 주사 용량: <strong>${finalDose.toFixed(2)} mL</strong>`;
        resultDiv.style.color = '#1e8e3e';
        resultDiv.style.borderColor = '#1e8e3e';
    }

    // --- 여기에 기존의 다른 모든 JS 함수들을 붙여넣으세요 ---
    // (예: createStomatitisChart, calculateCycloDose, calculateRemovalDate, ET Tube 관련 함수 등)
    // ...

});

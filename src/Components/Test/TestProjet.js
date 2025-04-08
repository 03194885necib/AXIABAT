import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  font-family: Arial, sans-serif;
  direction: rtl;
  margin: 20px;
  background-color:rgb(231, 224, 224);
`;

const Card = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
`;

const HeaderLeft = styled.div`
  text-align: left;
`;

const HeaderRight = styled.div`
  text-align: right;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #777;
`;

const TabContainer = styled.div`
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
`;

const TabButtons = styled.div`
  display: flex;
`;

const TabButton = styled.button`
  padding: 10px 15px;
  border: none;
  background-color:rgb(132, 130, 130);
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px 5px 0 0;
  margin-right: 5px;

  &.active {
    background-color: #fff;
    border-top: 2px solidrgb(13, 255, 0);
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
  }
`;

const TabContent = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 0 0 5px 5px;
  background-color: #fff;

  &.hidden {
    display: none;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-size: 16px;
  margin-bottom: 5px;
  color: #555;
`;

const FormInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;

  &[type="number"],
  &[type="text"],
  & select {
    /* Styles spécifiques aux inputs */
  }
`;

const DatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
`;

const DateGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateLabel = styled.label`
  font-size: 14px;
  color: #555;
  margin-bottom: 3px;
`;

const DateInput = styled.input`
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0056b3;
  }
`;

const TenderCard = () => {
  const [activeTab, setActiveTab] = React.useState('صفقة');

  const openTab = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <Container>
      <Card>
        <Header>
          <HeaderLeft>
            <Subtitle>GC_E01</Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <Title>carte de transaction</Title>
            <Subtitle>Direction générale de l'ingénierie, chef du service des travaux publics 3</Subtitle>
          </HeaderRight>
        </Header>

        <TabContainer>
          <ButtonRow>
            <Button className={activeTab === 'صفقة' ? 'active' : ''} onClick={() => openTab('صفقة')}>
              بيانات الصفقة
            </Button>
            <Button className={activeTab === 'تواريخ' ? 'active' : ''} onClick={() => openTab('تواريخ')}>
              تواريخ الصفقة
            </Button>
            <Button className={activeTab === 'متابعة' ? 'active' : ''} onClick={() => openTab('متابعة')}>
              تواريخ متابعة الإنجاز
            </Button>
            <Button className={activeTab === 'ختم' ? 'active' : ''} onClick={() => openTab('ختم')}>
              ختم الصفقة النهائي
            </Button>
            <Button className={activeTab === 'وثائق' ? 'active' : ''} onClick={() => openTab('وثائق')}>
              وثائق الصفقة
            </Button>
            <Button className={activeTab === 'محطات' ? 'active' : ''} onClick={() => openTab('محطات')}>
              محطات الضخ
            </Button>
            <Button className={activeTab === 'التقييم' ? 'active' : ''} onClick={() => openTab('التقييم')}>
              التقييم
            </Button>
            <Button className={activeTab === 'مراحل' ? 'active' : ''} onClick={() => openTab('مراحل')}>
              مراحل الصفقة
            </Button>
            <Button className={activeTab === 'حسابات' ? 'active' : ''} onClick={() => openTab('حسابات')}>
              الحسابات و مبالغ الصفقة
            </Button>
           </ButtonRow>
          <TabContent id="صفقة" className={activeTab === 'صفقة' ? '' : 'hidden'}>
            <FormGrid>
              <FormGroup>
                <FormLabel htmlFor="fiscalYear">السنة المالية</FormLabel>
                <FormInput type="number" id="fiscalYear" defaultValue="2024" />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="tenderNumber">رقم المناقصة</FormLabel>
                <FormInput type="text" id="tenderNumber" defaultValue="2024036" />
              </FormGroup>
              <FormGroup className="grid-2">
                <FormLabel htmlFor="subject">موضوعها</FormLabel>
                <FormInput
                  type="text"
                  id="subject"
                  defaultValue='أعمال جبارة لثلاث (03) محطات ضخ تابعة "لحي الزهور" بولاية تونس'
                />
              </FormGroup>
              <FormGroup className="grid-2">
                <FormLabel htmlFor="location">موقعها</FormLabel>
                <FormInput
                  type="text"
                  id="location"
                  defaultValue='أعمال جبارة لثلاث (03) محطات ضخ تابعة "لحي الزهور" بولاية تونس'
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="accompanyingDocuments">عدد الوثائق المصاحبة</FormLabel>
                <FormInput type="number" id="accompanyingDocuments" />
              </FormGroup>
            </FormGrid>
          </TabContent>
          <TabContent id="تواريخ" className={activeTab === 'تواريخ' ? '' : 'hidden'}>
            <DatesGrid>
              <DateGroup>
                <DateLabel htmlFor="announcementDate">تاريخ الإعلان</DateLabel>
                <DateInput type="text" id="announcementDate" defaultValue="2024-10-31" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="bidDeadline">آخر أجل لتقديم العروض</DateLabel>
                <DateInput type="text" id="bidDeadline" defaultValue="2024-11-15" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="bidOpeningDate">تاريخ فتح العروض</DateLabel>
                <DateInput type="text" id="bidOpeningDate" defaultValue="2024-11-15" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="boardPresentationDate">العرض على مجلس الإدارة</DateLabel>
                <DateInput type="text" id="boardPresentationDate" defaultValue="2024-07-15" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="approvalDate">المصادقة</DateLabel>
                <DateInput type="text" id="approvalDate" defaultValue="2024-09-13" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="registrationDate">التسجيل</DateLabel>
                <DateInput type="text" id="registrationDate" defaultValue="2024-10-15" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="executionPeriod">مدة الإنجاز</DateLabel>
                <FormInput type="number" id="executionPeriod" defaultValue="270" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="contractualGuarantee">مدة الضمان التعاقدية</DateLabel>
                <FormInput type="text" id="contractualGuarantee" />
              </DateGroup>
            </DatesGrid>
          </TabContent>
          <TabContent id="متابعة" className={activeTab === 'متابعة' ? '' : 'hidden'}>
            <DatesGrid>
              <DateGroup>
                <DateLabel htmlFor="actualStartDate">الإنطلاق الفعلي</DateLabel>
                <DateInput type="text" id="actualStartDate" defaultValue="2024-11-15" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="actualEndDate">نهاية الأشغال الفعلي</DateLabel>
                <DateInput type="text" id="actualEndDate" />
              </DateGroup>
            </DatesGrid>
          </TabContent>
          <TabContent id="ختم" className={activeTab === 'ختم' ? '' : 'hidden'}>
            <DatesGrid>
              <DateGroup>
                <DateLabel htmlFor="finalClosureDate">تاريخ الختم النهائي</DateLabel>
                <DateInput type="text" id="finalClosureDate" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="provisionalAcceptance">الاستلام الوقتي</DateLabel>
                <DateInput type="text" id="provisionalAcceptance" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="finalAcceptance">الاستلام النهائي</DateLabel>
                <DateInput type="text" id="finalAcceptance" />
              </DateGroup>
              <DateGroup>
                <DateLabel htmlFor="termination">الفسخ</DateLabel>
                <DateInput type="text" id="termination" />
              </DateGroup>
            </DatesGrid>
          </TabContent>
          <TabContent id="وثائق" className={activeTab === 'وثائق' ? '' : 'hidden'}>
            <p>محتوى وثائق الصفقة هنا.</p>
          </TabContent>
          <TabContent id="محطات" className={activeTab === 'محطات' ? '' : 'hidden'}>
            <p>معلومات محطات الضخ هنا.</p>
          </TabContent>
          <TabContent id="التقييم" className={activeTab === 'التقييم' ? '' : 'hidden'}>
            <p>معلومات التقييم هنا.</p>
          </TabContent>
          <TabContent id="مراحل" className={activeTab === 'مراحل' ? '' : 'hidden'}>
            <p>مراحل الصفقة هنا.</p>
          </TabContent>
          <TabContent id="حسابات" className={activeTab === 'حسابات' ? '' : 'hidden'}>
            <p>الحسابات و مبالغ الصفقة هنا.</p>
          </TabContent>
        </TabContainer>

        <ButtonRow>
          <Button>كشف الصفقة</Button>
          <Button>الضمانات</Button>
          <Button>بيان المقارنة</Button>
          <Button>تفاصيل الكشوفات بأسعار الملاحق</Button>
          <Button>الملاحق</Button>
        </ButtonRow>
      </Card>
    </Container>
  );
};

export default TenderCard;
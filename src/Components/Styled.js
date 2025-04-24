import styled from 'styled-components';

export const Modal = styled.div`  
  position: fixed;  
  top: 0;  
  left: 0;  
  width: 100%;  
  height: 100%;  
  background: rgba(0, 0, 0, 0.5);  
  display: ${props => props.isOpen ? 'flex' : 'none'};  
  justify-content: center;  
  align-items: center;  
  z-index: 1000;  
`;  

export const ModalContent = styled.div`  
  background: white;  
  padding: 20px;  
  border-radius: 8px;  
  width: 500px;  
  max-height: 80%;  
  overflow-y: auto; 
  `;  

  export const ModalFormGrid = styled.div`  
  display: grid;  
  grid-template-columns: 1fr 1fr;  
  gap: 10px;  
`;  

export const CloseButton = styled.button`  
  position: absolute;  
  top: 10px;  
  right: 10px;  
  background: red;  
  color: white;  
  border: none;  
  padding: 5px 10px;  
  cursor: pointer;  
`;  

export const Container = styled.div`
  font-family: Arial, sans-serif;
  direction: ltr;
  margin: 20px;
  background-color: rgb(231, 224, 224);
`;

export const Card = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

export const Header = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
`;

export const HeaderLeft = styled.div`
  text-align: left;
`;

export const HeaderRight = styled.div`
  text-align: right;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: #777;
`;

export const TabContainer = styled.div`
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
`;

export const TabContent = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 0 0 5px 5px;
  background-color: #fff;

  &.hidden {
    display: none;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;
export const ButtonRow2 = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 100px;
  direction:rtl;
`;

export const Button = styled.button`
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

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormLabel = styled.label`
  font-size: 16px;
  margin-bottom: 5px;
  color: #555;
`;

export const FormInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

export const DatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
`;

export const DateGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DateLabel = styled.label`
  font-size: 14px;
  color: #555;
  margin-bottom: 3px;
`;

export const DateInput = styled.input`
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
`;
export const SelectedArticlesSection = styled.div`  
  margin-top: 20px;  
  border: 1px solid #ddd;  
  padding: 15px;  
  border-radius: 5px;  
`; 
import styled from 'styled-components';

export const Wrapper = styled.div`
         width: 100%;
         height: 100%;
         display: flex;
         flex-direction: column;
         justify-content: center;
         align-items: center;

         @media (max-width: ${({ theme }) => theme.medium}) {
           text-align: center;
         }
       `;

export const GridWrapper = styled.div`
         display: grid;
         max-width: 800px;
         height: 230px;
         width: 80%;
         grid-template-columns: 2fr 2fr 1fr;
         grid-template-rows: 1fr 3fr;
         grid-gap: 20px;
         grid-template-areas:
           'title title button'
           'description description button';

         @media (max-width: ${({ theme }) => theme.medium}) {
           width: 90%;
           grid-template-columns: 1fr;
           grid-template-rows: 1fr 2fr 1fr;
           grid-template-areas:
            'title'
            'description'
            'button'
         }
       `;

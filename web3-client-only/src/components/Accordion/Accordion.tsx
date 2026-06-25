import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { type AccordionProps } from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, { type AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import { type SyntheticEvent, useState } from 'react';

import { useTranslation } from '../../hooks/useTranslation.hook';
import { Box } from '../Box/Box';
import { IconContainer } from '../IconContainer/IconContainer';
import { Text } from '../Text/Text';

const CustomAccordion = styled((p: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...p} />
))(({ theme }) => ({
  // border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.customColors.base,
  borderRadius: '6px',
  overflow: 'hidden',

  // '&:not(:last-child)': {
  //   borderBottom: 0,
  // },

  // '&:before': {
  //   display: 'none',
  // },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={
      <Box sx={{ transform: 'scale(0.6)' }}>
        <IconContainer
          bg="round"
          bgColor="pink"
          fillColor="base"
          icon={<ArrowForwardIosSharpIcon />}
          size="xs"
        />
      </Box>
    }
    {...props}
  />
))(({ theme }) => ({
  '& .w3-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  // '& .w3-content': {
  //   marginLeft: theme.spacing(1),
  // },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  // padding: theme.spacing(2),
  // padding: theme.customColors.base,
  // borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export const Accordion = ({ data }: { data: { id: number; title: string; content: string }[] }) => {
  const { t } = useTranslation();
  const [expanded, expandedSet] = useState<string | false>('');

  const handleChange = (panel: string) => (e: SyntheticEvent, newExpanded: boolean) => {
    expandedSet(newExpanded && panel);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {data.map((e) => (
        <CustomAccordion
          key={e.id}
          expanded={expanded === e.id.toString()}
          onChange={handleChange(e.id.toString())}
        >
          <AccordionSummary aria-controls={`${e.id}d-content`} id={`${e.id}d-header`}>
            <Text>{t(e.title)}</Text>
          </AccordionSummary>
          <AccordionDetails>
            <Text>{t(e.content)}</Text>
          </AccordionDetails>
        </CustomAccordion>
      ))}
    </Box>
  );
};

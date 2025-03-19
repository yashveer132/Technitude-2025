import React from "react";
import {
  Text,
  Heading,
  UnorderedList,
  ListItem,
  OrderedList,
  Code,
  Box,
  Divider,
  Link,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

export const parseMarkdown = (text) => {
  if (!text) return null;

  const cleanedText = text
    .replace(/\*\*\*/g, "**")
    .replace(/\*\s*\*/g, "")
    .replace(/\*\*\s*\*\*/g, "");

  const paragraphs = [];
  let tableContent = "";
  let inTable = false;

  cleanedText.split("\n").forEach((line) => {
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableContent = line;
      } else {
        tableContent += "\n" + line;
      }
    } else {
      if (inTable) {
        paragraphs.push(tableContent);
        inTable = false;
        tableContent = "";
      }

      if (line.trim() === "") {
        paragraphs.push("");
      } else if (
        paragraphs.length === 0 ||
        paragraphs[paragraphs.length - 1] === ""
      ) {
        paragraphs.push(line);
      } else {
        paragraphs[paragraphs.length - 1] += "\n" + line;
      }
    }
  });

  if (inTable) {
    paragraphs.push(tableContent);
  }

  return paragraphs
    .filter((p) => p !== "")
    .map((paragraph, pIndex) => {
      if (paragraph.startsWith("# ")) {
        return (
          <Heading key={pIndex} as="h1" size="xl" my={3}>
            {parseInlineMarkdown(paragraph.substring(2))}
          </Heading>
        );
      } else if (paragraph.startsWith("## ")) {
        return (
          <Heading key={pIndex} as="h2" size="lg" my={3}>
            {parseInlineMarkdown(paragraph.substring(3))}
          </Heading>
        );
      } else if (paragraph.startsWith("### ")) {
        return (
          <Heading key={pIndex} as="h3" size="md" my={3}>
            {parseInlineMarkdown(paragraph.substring(4))}
          </Heading>
        );
      } else if (
        paragraph
          .split("\n")
          .every(
            (line) =>
              line.trim().startsWith("- ") || line.trim().startsWith("* ")
          )
      ) {
        const listItems = paragraph
          .split("\n")
          .map((line) => line.trim().substring(2));
        return (
          <UnorderedList key={pIndex} spacing={1} my={3} paddingLeft={4}>
            {listItems.map((item, idx) => (
              <ListItem key={idx}>{parseInlineMarkdown(item)}</ListItem>
            ))}
          </UnorderedList>
        );
      } else if (paragraph.split("\n").some((line) => /^\d+\.\s/.test(line))) {
        const listItems = paragraph.split("\n").map((line) => {
          const match = line.trim().match(/^\d+\.\s(.+)$/);
          return match ? match[1] : line;
        });

        return (
          <OrderedList key={pIndex} spacing={1} my={3} paddingLeft={4}>
            {listItems.map((item, idx) => (
              <ListItem key={idx}>{parseInlineMarkdown(item)}</ListItem>
            ))}
          </OrderedList>
        );
      } else if (paragraph.startsWith("```") && paragraph.endsWith("```")) {
        let code = paragraph.substring(3, paragraph.length - 3);
        let language = "";

        const languageMatch = code.match(/^([a-zA-Z0-9]+)\n/);
        if (languageMatch) {
          language = languageMatch[1];
          code = code.substring(languageMatch[0].length);
        }

        return (
          <Box
            key={pIndex}
            bg="gray.100"
            color="gray.800"
            p={3}
            borderRadius="md"
            my={3}
            overflowX="auto"
            _dark={{ bg: "gray.700", color: "gray.200" }}
            position="relative"
          >
            {language && (
              <Text
                position="absolute"
                top={0}
                right={2}
                fontSize="xs"
                color="gray.500"
              >
                {language}
              </Text>
            )}
            <Code display="block" whiteSpace="pre">
              {code}
            </Code>
          </Box>
        );
      } else if (paragraph === "---") {
        return <Divider key={pIndex} my={4} borderColor="gray.300" />;
      } else if (paragraph.startsWith("|") && paragraph.includes("|\n|")) {
        const rows = paragraph.split("\n");
        const headers = rows[0]
          .split("|")
          .filter((cell) => cell.trim() !== "")
          .map((cell) => cell.trim());
        const hasHeaderSeparator = rows.length > 1 && rows[1].includes("-|-");

        const startRow = hasHeaderSeparator ? 2 : 1;
        const dataRows = rows
          .slice(startRow)
          .map((row) =>
            row
              .split("|")
              .filter((cell) => cell.trim() !== "")
              .map((cell) => cell.trim())
          )
          .filter((row) => row.length > 0);

        return (
          <Box overflowX="auto" key={pIndex} my={3}>
            <Table variant="simple" size="sm">
              {hasHeaderSeparator && (
                <Thead>
                  <Tr>
                    {headers.map((header, i) => (
                      <Th key={i}>{parseInlineMarkdown(header)}</Th>
                    ))}
                  </Tr>
                </Thead>
              )}
              <Tbody>
                {(hasHeaderSeparator ? dataRows : [headers, ...dataRows]).map(
                  (row, i) => (
                    <Tr key={i}>
                      {row.map((cell, j) => (
                        <Td key={j}>{parseInlineMarkdown(cell)}</Td>
                      ))}
                    </Tr>
                  )
                )}
              </Tbody>
            </Table>
          </Box>
        );
      } else if (paragraph.startsWith("> ")) {
        const alertText = paragraph.substring(2);
        return (
          <Alert key={pIndex} status="info" variant="left-accent" my={3}>
            <AlertIcon />
            {parseInlineMarkdown(alertText)}
          </Alert>
        );
      } else if (paragraph.startsWith("**") && paragraph.includes(":**")) {
        const titleMatch = paragraph.match(/^\*\*([^:]+):\*\*/);
        if (titleMatch) {
          const title = titleMatch[1];
          const content = paragraph.substring(titleMatch[0].length);
          return (
            <Box key={pIndex} my={3}>
              <Heading as="h4" size="sm" mb={1}>
                {title}
              </Heading>
              <Text>{parseInlineMarkdown(content)}</Text>
            </Box>
          );
        }
      }

      return (
        <Text key={pIndex} my={2} whiteSpace="pre-wrap">
          {parseInlineMarkdown(paragraph)}
        </Text>
      );
    });
};

const parseInlineMarkdown = (text) => {
  if (!text) return null;

  const parts = [];
  let currentIndex = 0;

  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > currentIndex) {
      parts.push(
        processInlineElements(text.substring(currentIndex, match.index))
      );
    }
    parts.push(
      <b key={`bold-${match.index}`}>{processInlineElements(match[1])}</b>
    );
    currentIndex = match.index + match[0].length;
  }

  if (currentIndex < text.length) {
    parts.push(processInlineElements(text.substring(currentIndex)));
  }

  return parts.length > 0 ? parts : text;
};

const processInlineElements = (text) => {
  if (!text) return text;

  let processed = text.replace(
    /\*([^*]+)\*/g,
    (_, content) => `<i>${content}</i>`
  );

  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, linkText, url) => `<a href="${url}">${linkText}</a>`
  );

  processed = processed.replace(
    /`([^`]+)`/g,
    (_, code) => `<code>${code}</code>`
  );

  if (processed.includes("<")) {
    const parts = [];
    let currentText = "";
    let i = 0;

    while (i < processed.length) {
      if (processed[i] === "<") {
        if (currentText) {
          parts.push(currentText);
          currentText = "";
        }

        if (processed.substring(i, i + 3) === "<i>") {
          const endIndex = processed.indexOf("</i>", i);
          if (endIndex !== -1) {
            parts.push(
              <i key={`i-${i}`}>{processed.substring(i + 3, endIndex)}</i>
            );
            i = endIndex + 4;
            continue;
          }
        } else if (processed.substring(i, i + 4) === "<code>") {
          const endIndex = processed.indexOf("</code>", i);
          if (endIndex !== -1) {
            parts.push(
              <Code key={`code-${i}`} fontSize="sm" px={1}>
                {processed.substring(i + 6, endIndex)}
              </Code>
            );
            i = endIndex + 7;
            continue;
          }
        } else if (processed.substring(i, i + 3) === "<a ") {
          const hrefStart = processed.indexOf('href="', i);
          const hrefEnd = processed.indexOf('">', hrefStart);
          const linkEnd = processed.indexOf("</a>", hrefEnd);

          if (hrefStart !== -1 && hrefEnd !== -1 && linkEnd !== -1) {
            const href = processed.substring(hrefStart + 6, hrefEnd);
            const linkText = processed.substring(hrefEnd + 2, linkEnd);
            parts.push(
              <Link key={`link-${i}`} color="blue.500" href={href} isExternal>
                {linkText}
              </Link>
            );
            i = linkEnd + 4;
            continue;
          }
        }
      }

      currentText += processed[i];
      i++;
    }

    if (currentText) {
      parts.push(currentText);
    }

    return parts.length > 0 ? parts : processed;
  }

  return processed;
};

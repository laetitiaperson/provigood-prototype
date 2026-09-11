#!/usr/bin/env python3
"""Conservative JavaScript minifier for the shipped copy of script.js.

Removes comments, indentation, repeated spaces and blank lines. Every line
break between statements is kept, so automatic semicolon insertion behaves
exactly as in the source. Strings, template literals and regular
expressions are copied untouched.

    python3 tools/minify-js.py dist/script.js

Like minify-css.py, it runs on the dist/ copy only: the repo keeps the
readable, commented source.
"""
import sys

# A "/" starts a regular expression, not a division, after one of these
# characters or keywords.
REGEX_AFTER_CHARS = set('(,=:[!&|?{};+-*%<>~^')
REGEX_AFTER_WORDS = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new',
                     'delete', 'void', 'throw', 'instanceof', 'yield', 'await'}


class Minifier:
    def __init__(self, src):
        self.src = src
        self.i = 0
        self.out = []
        self.line_has_code = False
        self.pending_space = False
        self.last = ''   # last significant character written as code
        self.word = ''   # identifier or keyword that ends the output, if any
        self.comments = 0

    def write(self, text, last=None):
        if self.pending_space and self.line_has_code:
            self.out.append(' ')
        self.pending_space = False
        self.out.append(text)
        self.line_has_code = True
        if last is not None:
            self.last, self.word = last, ''

    def newline(self):
        self.pending_space = False
        if self.line_has_code:
            self.out.append('\n')
            self.line_has_code = False

    def copy_quoted(self, quote):
        start = self.i
        self.i += 1
        while self.i < len(self.src):
            c = self.src[self.i]
            if c == '\\':
                self.i += 2
                continue
            self.i += 1
            if c == quote:
                break
        self.write(self.src[start:self.i], last='"')

    def copy_regex(self):
        start = self.i
        self.i += 1
        in_class = False
        while self.i < len(self.src):
            c = self.src[self.i]
            if c == '\\':
                self.i += 2
                continue
            self.i += 1
            if c == '\n':
                raise ValueError('unterminated regular expression near offset %d' % start)
            if c == '[':
                in_class = True
            elif c == ']':
                in_class = False
            elif c == '/' and not in_class:
                break
        while self.i < len(self.src) and self.src[self.i].isalpha():
            self.i += 1
        self.write(self.src[start:self.i], last='"')

    def copy_template(self):
        # Template text is copied verbatim; code inside ${ } is minified.
        self.write('`')
        self.i += 1
        while self.i < len(self.src):
            c = self.src[self.i]
            if c == '\\':
                self.out.append(self.src[self.i:self.i + 2])
                self.i += 2
            elif c == '`':
                self.out.append('`')
                self.i += 1
                break
            elif c == '$' and self.src[self.i + 1:self.i + 2] == '{':
                self.out.append('${')
                self.i += 2
                self.last, self.word = '{', ''
                self.code(stop_at_brace=True)
                self.out.append('}')
                self.i += 1
            else:
                self.out.append(c)
                self.i += 1
        self.last, self.word = '"', ''

    def code(self, stop_at_brace=False):
        depth = 0
        src = self.src
        while self.i < len(src):
            c = src[self.i]
            nxt = src[self.i + 1:self.i + 2]
            if c == '\n':
                self.newline()
                self.i += 1
            elif c in ' \t\r\f\v':
                self.pending_space = True
                self.i += 1
            elif c == '/' and nxt == '/':
                self.comments += 1
                end = src.find('\n', self.i)
                self.i = len(src) if end == -1 else end
            elif c == '/' and nxt == '*':
                self.comments += 1
                end = src.find('*/', self.i + 2)
                if end == -1:
                    raise ValueError('unterminated comment')
                if '\n' in src[self.i:end]:
                    self.newline()
                else:
                    self.pending_space = True
                self.i = end + 2
            elif c in '"\'':
                self.copy_quoted(c)
            elif c == '`':
                self.copy_template()
            elif c == '/' and (self.last == '' or self.last in REGEX_AFTER_CHARS
                               or self.word in REGEX_AFTER_WORDS):
                self.copy_regex()
            else:
                if stop_at_brace:
                    if c == '{':
                        depth += 1
                    elif c == '}':
                        if depth == 0:
                            return
                        depth -= 1
                self.write(c)
                self.i += 1
                self.last = c
                self.word = self.word + c if (c.isalnum() or c in '_$') else ''

    def run(self):
        self.code()
        return ''.join(self.out).rstrip('\n') + '\n'


def main():
    path = sys.argv[1]
    src = open(path, encoding='utf-8').read()
    m = Minifier(src)
    result = m.run()
    open(path, 'w', encoding='utf-8').write(result)
    print('%s: %d -> %d bytes, %d comments removed' % (path, len(src.encode()), len(result.encode()), m.comments))


if __name__ == '__main__':
    main()

import {Input, InputGroup, InputLeftElement} from '@chakra-ui/react';
import {SearchIcon} from '@chakra-ui/icons';

export default function SearchBar({onSearch}){
    return (
        <InputGroup maxW="md">
            <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300"></SearchIcon>
            </InputLeftElement>
            <Input placeholder='search assets...' onChange={(e) => onSearch(e.target.value)}>
            </Input>
        </InputGroup>
    );
}